###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401
# flake8: noqa: E501,F401
# pylint: disable=unused-import,line-too-long
# fmt: off
import baml_py
from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing import Dict, Generic, List, Literal, Optional, TypeVar, Union


T = TypeVar('T')
CheckName = TypeVar('CheckName', bound=str)

class Check(BaseModel):
    name: str
    expression: str
    status: str

class Checked(BaseModel, Generic[T,CheckName]):
    value: T
    checks: Dict[CheckName, Check]

def get_checks(checks: Dict[CheckName, Check]) -> List[Check]:
    return list(checks.values())

def all_succeeded(checks: Dict[CheckName, Check]) -> bool:
    return all(check.status == "succeeded" for check in get_checks(checks))



class MessageType(str, Enum):
    
    FeatureRequest = "FeatureRequest"
    BugReport = "BugReport"
    Question = "Question"
    Uncategorized = "Uncategorized"

class Classification(BaseModel):
    message_id: int
    message_type: "MessageType"

class Issue(BaseModel):
    number: int
    title: str
    body: Optional[str] = None
    type: Union[Literal["pull_request"], Literal["issue"]]

class Message(BaseModel):
    id: int
    content: str

class ThreadMessage(BaseModel):
    user_id: int
    content: str