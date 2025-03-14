import asyncio
import json
import base64
from typing import Any, Callable, Optional, TypeVar
from baml_py import BamlStream, Image

import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import uvicorn
from baml_client import b
from baml_client.type_builder import TypeBuilder
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from baml_client.types import Schema
from baml_py.errors import BamlError

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/execute_baml/call")
async def execute_baml_call(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
    baml_code: str = Form(...),
    return_type: str = Form(...)
) -> Schema:
    return await execute_baml(stream=False, file=file, content=content, url=url, baml_code=baml_code, return_type=return_type)


@app.post("/execute_baml/stream")
async def execute_baml_stream(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
    baml_code: str = Form(...),
    return_type: str = Form(...)
) -> StreamingResponse:
    return await execute_baml(stream=True, file=file, content=content, url=url, baml_code=baml_code, return_type=return_type)


@app.post("/generate_baml/call")
async def generate_baml_call(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
) -> Schema:
    return await generate_baml(stream=False, file=file, content=content, url=url)


@app.post("/generate_baml/stream")
async def generate_baml_stream(
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
) -> StreamingResponse:
    return await generate_baml(stream=True, file=file, content=content, url=url)


async def generate_baml(
    stream: bool,
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
) -> Schema | StreamingResponse:   
    final_content = await read_input_content(file, content, url)
    if stream:
        stream = b.stream.GenerateBAML(final_content)
        return handle_stream(stream, lambda x: x.model_dump())
    else:
        schema = await b.GenerateBAML(final_content)
        return schema


async def execute_baml(
    stream: bool,
    file: UploadFile = File(None),
    content: str = Form(None),
    url: str = Form(None),
    baml_code: str = Form(...),
    return_type: str = Form(...),
):   
    final_content = await read_input_content(file, content, url)
    tb = TypeBuilder()
    try:
        tb.add_baml(f"""
        {baml_code}

        dynamic class Response {{
            data {return_type}
        }}
        """)
    except BamlError as e:
        raise HTTPException(status_code=400, detail={
            "error": "BamlError",
            "message": str(e),
        })
    if stream:
        stream = b.stream.ExecuteBAML(final_content, { "tb": tb })
        return handle_stream(stream, lambda x: x.data)
    else:
        response = await b.ExecuteBAML(final_content, { "tb": tb })
        return response.data

StreamTypeVar = TypeVar("StreamTypeVar")
FinalTypeVar = TypeVar("FinalTypeVar")

def handle_stream(stream: BamlStream[StreamTypeVar, FinalTypeVar], to_data: Callable[[StreamTypeVar | FinalTypeVar], Any]):
    async def stream_baml():
        try:
            async for chunk in stream:
                chunk = to_data(chunk)
                yield json.dumps({ "partial": chunk }) + "\n\n"
                await asyncio.sleep(0)
            result = await stream.get_final_response()
            final = to_data(result)
            yield json.dumps({ "final": final }) + "\n\n"
        except Exception as e:
            yield json.dumps({ "error": str(e) }) + "\n\n"
    return StreamingResponse(stream_baml(), media_type="text/event-stream")


async def read_input_content(
    file: Optional[UploadFile] = None,
    content: Optional[str] = None,
    url: Optional[str] = None
) -> str | Image:
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
            file_content_base64 = base64.b64encode(file_content).decode("utf-8")
            media_type = file.content_type
            return Image.from_base64(base64=file_content_base64, media_type=media_type)
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
