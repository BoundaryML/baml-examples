from typing import Any, Type, TypeVar, Union, get_args, get_origin, Literal
from types import UnionType
from enum import Enum
from pydantic import BaseModel
from pydantic_core import PydanticUndefined

from baml_client.type_builder import TypeBuilder, FieldType
import warnings

T = TypeVar('T')

class PydanticTypeBuilder:
    def __init__(self, tb: TypeBuilder) -> None:
        self.tb = tb
        self._processed_models = {}

    def _get_field_type(self, python_type: Union[Type[T], Any], field_path: str = "<root>") -> FieldType:
        # Handle Any type
        if python_type is Any:
            warnings.warn(
                f"Field '{field_path}' using Any type, defaulting to string",
                UserWarning,
                stacklevel=2
            )
            return self.tb.string()

        origin = get_origin(python_type)
        if origin is None:
            if python_type is type(None):
                return self.tb.null()
            if issubclass(python_type, BaseModel):
                return self.parse_model(python_type)
            elif issubclass(python_type, Enum):
                enum_name = python_type.__name__
                new_enum = self.tb.add_enum(enum_name)
                for member in python_type:
                    if isinstance(member.value, str):
                        new_enum.add_value(member.value)
                    else:
                        warnings.warn(
                            f"Enum '{field_path}' value {member.value} is not a string, skipping",
                            UserWarning,
                            stacklevel=2
                        )
                return new_enum.type()
            elif python_type is str:
                return self.tb.string()
            elif python_type is int:
                return self.tb.int()
            elif python_type is float:
                return self.tb.float()
            elif python_type is bool:
                return self.tb.bool()
            else:
                warnings.warn(
                    f"Field '{field_path}' has unsupported type {python_type}, defaulting to string",
                    UserWarning,
                    stacklevel=2
                )
                return self.tb.string()

        args = get_args(python_type)
        if origin in (list, set, tuple):
            return self._get_field_type(args[0], f"{field_path}[]").list()
        elif origin is dict:
            if len(args) != 2:
                warnings.warn(
                    f"Field '{field_path}' using generic dict type, defaulting to Dict[str, str]",
                    UserWarning,
                    stacklevel=2
                )
                return self.tb.map(self.tb.string(), self.tb.string())

            key_type = self._get_field_type(args[0], f"{field_path}[key]")
            value_type = self._get_field_type(args[1], f"{field_path}[value]")
            map_type = self.tb.map(key_type, value_type)

            # Check if this dict is part of a Union
            parent_origin = get_origin(python_type)
            if parent_origin in (UnionType, UnionType):
                parent_args = get_args(python_type)
                if type(None) in parent_args:
                    return map_type.optional()
            return map_type
        elif origin is Literal:
            # Handle multiple literal values as a union of literals
            literal_values = args
            literal_types = []
            for value in literal_values:
                if isinstance(value, str):
                    literal_types.append(self.tb.literal_string(value))
                elif isinstance(value, int):
                    literal_types.append(self.tb.literal_int(value))
                elif isinstance(value, bool):
                    literal_types.append(self.tb.literal_bool(value))
                else:
                    warnings.warn(
                        f"Field '{field_path}' has unsupported literal type {type(value)}, defaulting to string",
                        UserWarning,
                        stacklevel=2
                    )
                    return self.tb.string()
            return self.tb.union(literal_types) if len(literal_types) > 1 else literal_types[0]
        elif origin in (Union, UnionType):
            types = [t for t in args if t is not type(None)]

            # Handle all types in the union
            field_types = []
            for t in types:
                if t is Any:
                    field_types.append(self.tb.string())
                else:
                    field_types.append(self._get_field_type(t, field_path))

            result = self.tb.union(field_types) if len(field_types) > 1 else field_types[0]
            return result.optional() if type(None) in args else result

        warnings.warn(
            f"Field '{field_path}' has unsupported complex type {python_type}, defaulting to string",
            UserWarning,
            stacklevel=2
        )
        return self.tb.string()


    def parse_model(self, model_class: Type[BaseModel]) -> FieldType:
        model_name = model_class.__name__

        if model_name in self._processed_models:
            return self._processed_models[model_name]

        new_cls = self.tb.add_class(model_name)
        self._processed_models[model_name] = new_cls.type()

        for name, field in model_class.model_fields.items():
            # Handle None annotation by defaulting to Any
            python_type = field.annotation if field.annotation is not None else Any
            field_type = self._get_field_type(python_type, f"{model_name}.{name}")

            if not field.is_required():
                field_type = field_type.optional()

            property_ = new_cls.add_property(name, field_type)

            if field.description:
                description = field.description
                if field.get_default() not in [PydanticUndefined, None]:
                    description = f"{description}\nDefault: {field.get_default()}"
                if description:
                    property_.description(description.strip())

        return new_cls.type()


def build_from_pydantic(model: Type[BaseModel], tb: TypeBuilder) -> FieldType:
    builder = PydanticTypeBuilder(tb)
    return builder.parse_model(model)
