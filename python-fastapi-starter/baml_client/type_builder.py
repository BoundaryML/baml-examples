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
import typing
from baml_py.baml_py import FieldType, EnumValueBuilder, EnumBuilder, ClassBuilder
from baml_py.type_builder import TypeBuilder as _TypeBuilder, ClassPropertyBuilder
from .globals import DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME


class TypeBuilder(_TypeBuilder):
    def __init__(self):
        super().__init__(classes=set(
          ["Answer","BookAnalysis","CharacterDescription","Citation","Context","Document","DynamicOutput","Education","Message","PopularityOverTime","Ranking","Resume","Score","Spells","WordCount",]
        ), enums=set(
          ["Category","MyEnum","Role",]
        ), runtime=DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME)


    
    @property
    def DynamicOutput(self) -> "DynamicOutputBuilder":
        return DynamicOutputBuilder(self)





class DynamicOutputBuilder:
    def __init__(self, tb: _TypeBuilder):
        _tb = tb._tb # type: ignore (we know how to use this private attribute)
        self.__bldr = _tb.class_("DynamicOutput")
        self.__properties: typing.Set[str] = set([])
        self.__props = DynamicOutputProperties(self.__bldr, self.__properties)

    def type(self) -> FieldType:
        return self.__bldr.field()

    @property
    def props(self) -> "DynamicOutputProperties":
        return self.__props
    
    def list_properties(self) -> typing.List[typing.Tuple[str, ClassPropertyBuilder]]:
        return [(name, ClassPropertyBuilder(self.__bldr.property(name))) for name in self.__properties]

    def add_property(self, name: str, type: FieldType) -> ClassPropertyBuilder:
        if name in self.__properties:
            raise ValueError(f"Property {name} already exists.")
        return ClassPropertyBuilder(self.__bldr.property(name).type(type))

class DynamicOutputProperties:
    def __init__(self, cls_bldr: ClassBuilder, properties: typing.Set[str]):
        self.__bldr = cls_bldr
        self.__properties = properties

    

    def __getattr__(self, name: str) -> ClassPropertyBuilder:
        if name not in self.__properties:
            raise AttributeError(f"Property {name} not found.")
        return ClassPropertyBuilder(self.__bldr.property(name))





__all__ = ["TypeBuilder"]