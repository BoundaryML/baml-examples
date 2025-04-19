import asyncio
import json
from scraper import scrape_website
from tqdm import tqdm
from baml_client import b
from PIL import Image
from baml_client.tracing import trace
from files import get_analysis_path, get_content_path, get_screenshot_path
from pydantic import BaseModel
from typing import Callable, Dict, Any, List, Literal, Optional
from baml_client.types import ContentAnalysis


semaphore = asyncio.Semaphore(5)


class ExportedAnalysis(BaseModel):
    url: str
    title: str
    category: str
    analysis: Dict[str, Any] | None

class SiteAnalysis(BaseModel):
    status: Literal["not_started", "started", "finished"]
    pages: List[str]
    results: List[ExportedAnalysis]

    def add_page(self, page: str):
        self.pages.append(page)

    def add_result(self, result: ExportedAnalysis):
        self.results.append(result)


@trace
async def analyze_page(page_url: str, content: str, image: Image.Image) -> ExportedAnalysis:
    analysis_path = get_analysis_path(page_url)

    if analysis_path.exists():
        data = json.loads(analysis_path.read_text())
        try:
            return ExportedAnalysis.model_validate(data)
        except Exception as e:
            print("Failed to validate JSON for page", page_url)

    async with semaphore:
        try:
            result = await b.IsBlogPost(content)
            if result.type != "other":
                analysis = await b.AnalyzeContentDepth(content)
            else:
                analysis = None
            
            exported_analysis = ExportedAnalysis(
                url=page_url,
                title=result.title,
                category=result.type,
                analysis=analysis.model_dump() if analysis else None
            )
            analysis_path.write_text(exported_analysis.model_dump_json())
        except Exception as e:
            exported_analysis = ExportedAnalysis(
                url=page_url,
                title="Unknown",
                category="error",
                analysis=None
            )
            analysis_path.write_text(exported_analysis.model_dump_json())

    return exported_analysis

@trace
async def analyze_website(url: str, site_analysis: SiteAnalysis):
    tasks: List[asyncio.Task[ExportedAnalysis]] = []
    
    for page_url, content, image in scrape_website(url):
        site_analysis.add_page(page_url)
        tasks.append(
            asyncio.create_task(analyze_page(page_url, content, image))
        )

    # use a progress bar for the tasks
    with tqdm(total=len(tasks), desc="Analyzing pages") as pbar:
        async def run_task(task: asyncio.Task[ExportedAnalysis]):
            result = await task
            if result:
                site_analysis.add_result(result)
            pbar.update(1)

        await asyncio.gather(*[
            run_task(task)
            for task in tasks
        ])
    
    site_analysis.status = "finished"
