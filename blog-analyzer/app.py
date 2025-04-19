from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Literal, Optional
import asyncio
from hello import ExportedAnalysis, SiteAnalysis, analyze_website
from baml_client.types import ContentAnalysis

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


class URLRequest(BaseModel):
    url: str


analysis_results: Dict[str, SiteAnalysis] = {}


@app.post("/analyze")
async def analyze_url(request: URLRequest, background_tasks: BackgroundTasks):
    if request.url in analysis_results:
        return {"message": "Analysis already started"}

    analysis_results[request.url] = SiteAnalysis(status="started", pages=[], results=[])
    # Start the analysis in the background
    background_tasks.add_task(analyze_website, request.url, analysis_results[request.url])
    return {"message": "Analysis started"}

class ResultsRequest(BaseModel):
    url: str

class ResultsResponse(BaseModel):
    status: str
    results: Dict[str, Optional[ExportedAnalysis]]

@app.get("/results", response_model=ResultsResponse)
async def get_results(url: str):
    if url not in analysis_results:
        return ResultsResponse(status="not_started", results={})
    def find_page_result(page: str) -> Optional[ExportedAnalysis]:
        for result in analysis_results[url].results:
            if result.url == page:
                return result
        return None
    return ResultsResponse(status=analysis_results[url].status, results={
        page: find_page_result(page) for page in analysis_results[url].pages
    })
