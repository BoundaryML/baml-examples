###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml-py
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401,F821
# flake8: noqa: E501,F401,F821
# pylint: disable=unused-import,line-too-long
# fmt: off
from typing import Any, Dict, List, Optional, Union, TypedDict, Type, Literal
from typing_extensions import NotRequired

import baml_py

from . import types
from .types import Checked, Check
from .type_builder import TypeBuilder


class BamlCallOptions(TypedDict, total=False):
    tb: NotRequired[TypeBuilder]
    client_registry: NotRequired[baml_py.baml_py.ClientRegistry]


class AsyncHttpRequest:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager

    
    async def AnalyzeBooks(
        self,
        input: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "AnalyzeBooks",
        {
          "input": input,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        False,
      )
    
    async def AnswerQuestion(
        self,
        question: str,context: types.Context,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "AnswerQuestion",
        {
          "question": question,
          "context": context,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        False,
      )
    
    async def ClassifyMessage(
        self,
        convo: List[types.Message],
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "ClassifyMessage",
        {
          "convo": convo,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        False,
      )
    
    async def DescribeCharacter(
        self,
        first_image: baml_py.Image,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "DescribeCharacter",
        {
          "first_image": first_image,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        False,
      )
    
    async def ExtractResume(
        self,
        raw_text: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "ExtractResume",
        {
          "raw_text": raw_text,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        False,
      )
    


class AsyncHttpStreamRequest:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager

    
    async def AnalyzeBooks(
        self,
        input: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "AnalyzeBooks",
        {
          "input": input,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        True,
      )
    
    async def AnswerQuestion(
        self,
        question: str,context: types.Context,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "AnswerQuestion",
        {
          "question": question,
          "context": context,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        True,
      )
    
    async def ClassifyMessage(
        self,
        convo: List[types.Message],
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "ClassifyMessage",
        {
          "convo": convo,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        True,
      )
    
    async def DescribeCharacter(
        self,
        first_image: baml_py.Image,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "DescribeCharacter",
        {
          "first_image": first_image,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        True,
      )
    
    async def ExtractResume(
        self,
        raw_text: str,
        baml_options: BamlCallOptions = {},
    ) -> baml_py.HTTPRequest:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      return await self.__runtime.build_request(
        "ExtractResume",
        {
          "raw_text": raw_text,
        },
        self.__ctx_manager.get(),
        tb,
        __cr__,
        True,
      )
    


__all__ = ["AsyncHttpRequest", "AsyncHttpStreamRequest"]