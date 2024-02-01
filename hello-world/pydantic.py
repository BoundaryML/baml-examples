from pydantic import BaseModel
from typing import List, Union

class Resume(BaseModel):
    name: str
    skills: List[str]