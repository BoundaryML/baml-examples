from baml_client import b
from parse_json_schema import parse_json_schema
from baml_client.type_builder import TypeBuilder
from enum import Enum
from typing import Union

from typing_extensions import Annotated

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict

class FooBar(BaseModel):
    count: int
    size: Union[float, None] = None


class Gender(str, Enum):
    male = 'male'
    female = 'female'
    other = 'other'
    not_given = 'not_given'


class MainModel(BaseModel):
    """
    This is the description of the main model
    """

    model_config = ConfigDict(title='Main')

    foo_bar: FooBar
    gender: Annotated[Union[Gender, None], Field(alias='Gender')] = None
    snap: int = Field(
        default=42,
        title='The Snap',
        description='this is the value of snap',
        gt=30,
        lt=50,
    )



def parse(raw_text: str):
    tb = TypeBuilder()
    res = parse_json_schema(MainModel.model_json_schema(), tb)
    tb.DyanamicContainer.add_property("data", res)
    response = b.ExtractDynamicTypes(raw_text, { "tb": tb })

    # Sadly nothing in static analysis can help us here
    # its a type defined at runtime!
    data = response.data # type: ignore

    # This is guaranteed to be succeed thanks to BAML!
    content = MainModel.model_validate(data)


def test_one():
    parse("Make an example!")

if __name__ == "__main__":
    test_one()