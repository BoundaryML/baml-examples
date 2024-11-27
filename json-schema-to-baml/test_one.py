from baml_client import b
from parse_json_schema import parse_json_schema
from baml_client.type_builder import TypeBuilder
from enum import Enum
from typing import Union, List

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    graduation_date: str
    gpa: Union[float, None]


class Resume(BaseModel):
    personal_info: dict
    summary: str
    education: List[Education]
    skills: List[str]
    languages: List[str]


def parse(raw_text: str):
    tb = TypeBuilder()
    res = parse_json_schema(Resume.model_json_schema(), tb)
    # DynamicContainer is the OutputType of the baml function ExtractDynamicTypes
    tb.DynamicContainer.add_property("data", res)
    response = b.ExtractDynamicTypes(raw_text, {"tb": tb})

    # Sadly nothing in static analysis can help us here
    # its a type defined at runtime!
    data = response.data  # type: ignore

    # This is guaranteed to be succeed thanks to BAML!
    content = Resume.model_validate(data)
    print(content)


def test_one():
    parse(
        """
John Doe
john.doe@example.com
123 Anywhere St. Any City, ST 12345

Objective: To obtain a position in the field of software engineering where I can apply my skills in software development and contribute to innovative projects.

Work Experience:
Software Engineer at XYZ Corp.

Skills:
Python, JavaScript, SQL, Git, Docker
    """
    )


if __name__ == "__main__":
    test_one()
