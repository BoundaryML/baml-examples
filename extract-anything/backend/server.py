import asyncio
import json
import base64
from typing import Optional

import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import uvicorn
from baml_client import b
from baml_client.type_builder import TypeBuilder
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def read_input_content(
    file: Optional[UploadFile] = None,
    content: Optional[str] = None,
    url: Optional[str] = None
) -> str:
    """
    Processes the input from one of the following:
    - file: an uploaded file (image, audio, PDF or text)
    - content: a text string
    - url: a URL to an image, audio, PDF or text resource
    Returns a string that is either plain text or a base64 encoded representation.
    """
    if content is not None:
        return content
    elif file is not None:
        # For files, if the content type starts with "text", decode using utf-8.
        # Otherwise, base64-encode the binary content.
        if file.content_type.startswith("text"):
            file_content = await file.read()
            return file_content.decode("utf-8")
        else:
            file_content = await file.read()
            return base64.b64encode(file_content).decode("utf-8")
    elif url is not None:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Unable to fetch content from the provided URL")
            ctype = response.headers.get("content-type", "")
            if "text" in ctype:
                return response.text
            else:
                return base64.b64encode(response.content).decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="No valid content provided. Please provide a file, content, or URL.")

@app.post("/generate_baml/stream")
async def generate_baml_stream(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None)
):  
    final_content = await read_input_content(file, content, url)

    async def stream_baml(content_str: str):
        stream = b.stream.GenerateBAML(content_str)
        async for chunk in stream:
            yield str(chunk.model_dump_json()) + "\n"
            # yield backpressure handling
            await asyncio.sleep(0)

    return StreamingResponse(stream_baml(final_content), media_type="text/event-stream")


@app.post("/generate_baml/call")
async def generate_baml_call(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None)
):   
    final_content = await read_input_content(file, content, url)
    schema = await b.GenerateBAML(final_content)
    return schema


@app.post("/execute_baml/stream")
async def execute_baml_stream(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
    baml_code: str = Form(...),
    return_type: str = Form(...)
):   
    final_content = await read_input_content(file, content, url)
    tb = TypeBuilder()
    tb.add_baml(f"""
    {baml_code}

    dynamic class Response {{
        data {return_type}
    }}
    """)
    
    async def stream_baml(content_str: str):
        stream = b.stream.ExecuteBAML(content_str, { "tb": tb })
        async for chunk in stream:
            if chunk.data is not None:
                yield json.dumps(chunk.data) + "\n\n"
                await asyncio.sleep(0)

    return StreamingResponse(stream_baml(final_content), media_type="text/event-stream")


@app.post("/execute_baml/call")
async def execute_baml_call(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
    baml_code: str = Form(...),
    return_type: str = Form(...)
):   
    final_content = await read_input_content(file, content, url)
    tb = TypeBuilder()
    tb.add_baml(f"""
    {baml_code}

    dynamic class Response {{
        data {return_type}
    }}
    """)
    response = await b.ExecuteBAML(final_content, { "tb": tb })
    return response.data


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
