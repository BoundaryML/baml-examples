# This file is generated by the BAML compiler.
# Do not edit this file directly.
# Instead, edit the BAML files and recompile.

# ruff: noqa: E501,F401
# flake8: noqa: E501,F401
# pylint: disable=unused-import,line-too-long
# fmt: off

from ..types.enums.enm_intent import Intent
from baml_core.stream import AsyncStream
from typing import Callable, List, Protocol, runtime_checkable


import typing

import pytest
from contextlib import contextmanager
from unittest import mock

ImplName = typing.Literal["simple", "advanced"]

T = typing.TypeVar("T", bound=typing.Callable[..., typing.Any])
CLS = typing.TypeVar("CLS", bound=type)


IClassifyIntentOutput = List[Intent]

@runtime_checkable
class IClassifyIntent(Protocol):
    """
    This is the interface for a function.

    Args:
        query: str

    Returns:
        List[Intent]
    """

    async def __call__(self, *, query: str) -> List[Intent]:
        ...

   

@runtime_checkable
class IClassifyIntentStream(Protocol):
    """
    This is the interface for a stream function.

    Args:
        query: str

    Returns:
        AsyncStream[List[Intent], List[Intent]]
    """

    def __call__(self, *, query: str
) -> AsyncStream[List[Intent], List[Intent]]:
        ...
class BAMLClassifyIntentImpl:
    async def run(self, *, query: str) -> List[Intent]:
        ...
    
    def stream(self, *, query: str
) -> AsyncStream[List[Intent], List[Intent]]:
        ...

class IBAMLClassifyIntent:
    def register_impl(
        self, name: ImplName
    ) -> typing.Callable[[IClassifyIntent, IClassifyIntentStream], None]:
        ...

    async def __call__(self, *, query: str) -> List[Intent]:
        ...

    def stream(self, *, query: str
) -> AsyncStream[List[Intent], List[Intent]]:
        ...

    def get_impl(self, name: ImplName) -> BAMLClassifyIntentImpl:
        ...

    @contextmanager
    def mock(self) -> typing.Generator[mock.AsyncMock, None, None]:
        """
        Utility for mocking the ClassifyIntentInterface.

        Usage:
            ```python
            # All implementations are mocked.

            async def test_logic() -> None:
                with baml.ClassifyIntent.mock() as mocked:
                    mocked.return_value = ...
                    result = await ClassifyIntentImpl(...)
                    assert mocked.called
            ```
        """
        ...

    @typing.overload
    def test(self, test_function: T) -> T:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the ClassifyIntentInterface.

        Args:
            test_function : T
                The test function to be decorated.

        Usage:
            ```python
            # All implementations will be tested.

            @baml.ClassifyIntent.test
            async def test_logic(ClassifyIntentImpl: IClassifyIntent) -> None:
                result = await ClassifyIntentImpl(...)
            ```
        """
        ...

    @typing.overload
    def test(self, *, exclude_impl: typing.Iterable[ImplName] = [], stream: bool = False) -> pytest.MarkDecorator:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the ClassifyIntentInterface.

        Args:
            exclude_impl : Iterable[ImplName]
                The names of the implementations to exclude from testing.
            stream: bool
                If set, will return a streamable version of the test function.

        Usage:
            ```python
            # All implementations except the given impl will be tested.

            @baml.ClassifyIntent.test(exclude_impl=["implname"])
            async def test_logic(ClassifyIntentImpl: IClassifyIntent) -> None:
                result = await ClassifyIntentImpl(...)
            ```

            ```python
            # Streamable version of the test function.

            @baml.ClassifyIntent.test(stream=True)
            async def test_logic(ClassifyIntentImpl: IClassifyIntentStream) -> None:
                async for result in ClassifyIntentImpl(...):
                    ...
            ```
        """
        ...

    @typing.overload
    def test(self, test_class: typing.Type[CLS]) -> typing.Type[CLS]:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the ClassifyIntentInterface.

        Args:
            test_class : Type[CLS]
                The test class to be decorated.

        Usage:
        ```python
        # All implementations will be tested in every test method.

        @baml.ClassifyIntent.test
        class TestClass:
            def test_a(self, ClassifyIntentImpl: IClassifyIntent) -> None:
                ...
            def test_b(self, ClassifyIntentImpl: IClassifyIntent) -> None:
                ...
        ```
        """
        ...

BAMLClassifyIntent: IBAMLClassifyIntent