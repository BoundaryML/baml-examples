# This file is generated by the BAML compiler.
# Do not edit this file directly.
# Instead, edit the BAML files and recompile.

# ruff: noqa: E501,F401
# flake8: noqa: E501,F401
# pylint: disable=unused-import,line-too-long
# fmt: off

from ..types.classes.cls_meetingrequestpartial import MeetingRequestPartial
from ..types.classes.cls_validation import Validation
from ..types.partial.classes.cls_meetingrequestpartial import PartialMeetingRequestPartial
from ..types.partial.classes.cls_validation import PartialValidation
from baml_core.stream import AsyncStream
from typing import Callable, Protocol, runtime_checkable


import typing

import pytest
from contextlib import contextmanager
from unittest import mock

ImplName = typing.Literal["v1"]

T = typing.TypeVar("T", bound=typing.Callable[..., typing.Any])
CLS = typing.TypeVar("CLS", bound=type)


IGetNextQuestionOutput = Validation

@runtime_checkable
class IGetNextQuestion(Protocol):
    """
    This is the interface for a function.

    Args:
        arg: MeetingRequestPartial

    Returns:
        Validation
    """

    async def __call__(self, arg: MeetingRequestPartial, /) -> Validation:
        ...

   

@runtime_checkable
class IGetNextQuestionStream(Protocol):
    """
    This is the interface for a stream function.

    Args:
        arg: MeetingRequestPartial

    Returns:
        AsyncStream[Validation, PartialValidation]
    """

    def __call__(self, arg: MeetingRequestPartial, /) -> AsyncStream[Validation, PartialValidation]:
        ...
class BAMLGetNextQuestionImpl:
    async def run(self, arg: MeetingRequestPartial, /) -> Validation:
        ...
    
    def stream(self, arg: MeetingRequestPartial, /) -> AsyncStream[Validation, PartialValidation]:
        ...

class IBAMLGetNextQuestion:
    def register_impl(
        self, name: ImplName
    ) -> typing.Callable[[IGetNextQuestion, IGetNextQuestionStream], None]:
        ...

    async def __call__(self, arg: MeetingRequestPartial, /) -> Validation:
        ...

    def stream(self, arg: MeetingRequestPartial, /) -> AsyncStream[Validation, PartialValidation]:
        ...

    def get_impl(self, name: ImplName) -> BAMLGetNextQuestionImpl:
        ...

    @contextmanager
    def mock(self) -> typing.Generator[mock.AsyncMock, None, None]:
        """
        Utility for mocking the GetNextQuestionInterface.

        Usage:
            ```python
            # All implementations are mocked.

            async def test_logic() -> None:
                with baml.GetNextQuestion.mock() as mocked:
                    mocked.return_value = ...
                    result = await GetNextQuestionImpl(...)
                    assert mocked.called
            ```
        """
        ...

    @typing.overload
    def test(self, test_function: T) -> T:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the GetNextQuestionInterface.

        Args:
            test_function : T
                The test function to be decorated.

        Usage:
            ```python
            # All implementations will be tested.

            @baml.GetNextQuestion.test
            async def test_logic(GetNextQuestionImpl: IGetNextQuestion) -> None:
                result = await GetNextQuestionImpl(...)
            ```
        """
        ...

    @typing.overload
    def test(self, *, exclude_impl: typing.Iterable[ImplName] = [], stream: bool = False) -> pytest.MarkDecorator:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the GetNextQuestionInterface.

        Args:
            exclude_impl : Iterable[ImplName]
                The names of the implementations to exclude from testing.
            stream: bool
                If set, will return a streamable version of the test function.

        Usage:
            ```python
            # All implementations except the given impl will be tested.

            @baml.GetNextQuestion.test(exclude_impl=["implname"])
            async def test_logic(GetNextQuestionImpl: IGetNextQuestion) -> None:
                result = await GetNextQuestionImpl(...)
            ```

            ```python
            # Streamable version of the test function.

            @baml.GetNextQuestion.test(stream=True)
            async def test_logic(GetNextQuestionImpl: IGetNextQuestionStream) -> None:
                async for result in GetNextQuestionImpl(...):
                    ...
            ```
        """
        ...

    @typing.overload
    def test(self, test_class: typing.Type[CLS]) -> typing.Type[CLS]:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the GetNextQuestionInterface.

        Args:
            test_class : Type[CLS]
                The test class to be decorated.

        Usage:
        ```python
        # All implementations will be tested in every test method.

        @baml.GetNextQuestion.test
        class TestClass:
            def test_a(self, GetNextQuestionImpl: IGetNextQuestion) -> None:
                ...
            def test_b(self, GetNextQuestionImpl: IGetNextQuestion) -> None:
                ...
        ```
        """
        ...

BAMLGetNextQuestion: IBAMLGetNextQuestion
