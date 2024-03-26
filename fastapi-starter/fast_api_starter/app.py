from fastapi import FastAPI
import os
from baml_client import baml as b

from fastapi.responses import StreamingResponse


app = FastAPI()

@app.get("/")
def index():
    return {"Hello": "World"}

@app.get("/extract_resume")
async def extract_resume():
    
    resume = """
    John Doe
    1234 Elm Street
    Springfield, IL 62701
    (123) 456-7890

    Objective: To obtain a position as a software engineer.

    Education:
    Bachelor of Science in Computer Science
    University of Illinois at Urbana-Champaign
    May 2020 - May 2024

    Experience:
    Software Engineer Intern
    Google
    May 2022 - August 2022
    - Worked on the Google Search team
    - Developed new features for the search engine
    - Wrote code in Python and C++

    Software Engineer Intern
    Facebook
    May 2021 - August 2021
    - Worked on the Facebook Messenger team
    - Developed new features for the messenger app
    - Wrote code in Python and Java
    """
    async def stream_resume(resume):
        async with b.ExtractResume.stream(resume) as stream:
            async for chunk in stream.parsed_stream:
                print(chunk.delta)
                if chunk.is_parseable:
                    yield str(chunk.parsed.model_dump_json()) + "\n"
                
    return StreamingResponse(stream_resume(resume), media_type="text/plain")

