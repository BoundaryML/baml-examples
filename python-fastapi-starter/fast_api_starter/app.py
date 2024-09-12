from fastapi import FastAPI
import os
from baml_client import b
from baml_client.types import Message, Role


async def extract_resume():

    classify_response = await b.ClassifyMessage(
        convo=[Message(role=Role.Customer, content="I would like to cancel my order.")],
    )
    print(f"Got {classify_response} from BAML")

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
        stream = b.stream.ExtractResume(resume)
        async for chunk in stream:
            yield str(chunk.model_dump_json()) + "\n"

    return StreamingResponse(stream_resume(resume), media_type="text/plain")
