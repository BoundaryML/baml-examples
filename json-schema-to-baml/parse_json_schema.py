import warnings
from typing import Any, Dict
from baml_client.type_builder import TypeBuilder, FieldType

class SchemaAdder:
    def __init__(self, tb: TypeBuilder, schema: Dict[str, Any]):
        self.tb = tb
        self.schema = schema
        self._ref_cache = {}

    def _parse_object(self, json_schema: Dict[str, Any]) -> FieldType:
        assert json_schema["type"] == "object"
        name = json_schema.get("title")
        if name is None:
            raise ValueError("Title is required in JSON schema for object type")

        required_fields = json_schema.get("required", [])
        assert isinstance(required_fields, list)

        new_cls = self.tb.add_class(name)
        if properties := json_schema.get("properties"):
            assert isinstance(properties, dict)
            for field_name, field_schema in properties.items():
                assert isinstance(field_schema, dict)
                default_value = field_schema.get("default")
                # Handle case when properties are not defined, BAML expects `map<string, string>`
                if field_schema.get("properties") is None and field_schema.get("type") == "object":
                    warnings.warn(
                        f"Field '{field_name}' uses generic dict type which defaults to Dict[str, str]. "
                        "If a more specific type is needed, please provide a specific Pydantic model instead.",
                        UserWarning,
                        stacklevel=2
                    )
                    field_type = self.tb.map(self.tb.string(), self.tb.string())
                else:
                    field_type = self.parse(field_schema)
                if field_name not in required_fields:
                    if default_value is None:
                        field_type = field_type.optional()
                property_ = new_cls.add_property(field_name, field_type)
                if description := field_schema.get("description"):
                    assert isinstance(description, str)
                    if default_value is not None:
                        description = (
                            description.strip() + "\n" + f"Default: {default_value}"
                        )
                        description = description.strip()
                    if len(description) > 0:
                        property_.description(description)
        return new_cls.type()

    def _parse_string(self, json_schema: Dict[str, Any]) -> FieldType:
        assert json_schema["type"] == "string"
        title = json_schema.get("title")

        if enum := json_schema.get("enum"):
            assert isinstance(enum, list)
            if title is None:
                # Treat as a union of literals
                return self.tb.union([self.tb.literal_string(value) for value in enum])
            new_enum = self.tb.add_enum(title)
            for value in enum:
                new_enum.add_value(value)
            return new_enum.type()
        return self.tb.string()

    def _load_ref(self, ref: str) -> FieldType:
        assert ref.startswith("#/"), f"Only local references are supported: {ref}"
        _, left, right = ref.split("/", 2)

        if ref not in self._ref_cache:
            if refs := self.schema.get(left):
                assert isinstance(refs, dict)
                if right not in refs:
                    raise ValueError(f"Reference {ref} not found in schema")
                self._ref_cache[ref] = self.parse(refs[right])
        return self._ref_cache[ref]

    def parse(self, json_schema: Dict[str, Any]) -> FieldType:
        if any_of := json_schema.get("anyOf"):
            assert isinstance(any_of, list)
            return self.tb.union([self.parse(sub_schema) for sub_schema in any_of])

        if additional_properties := json_schema.get("additionalProperties"):
            assert isinstance(additional_properties, dict)
            if any_of_additional_props := additional_properties.get("anyOf"):
                assert isinstance(any_of_additional_props, list)
                return self.tb.map(self.tb.string(), self.tb.union([self.parse(sub_schema) for sub_schema in any_of_additional_props]))

        if ref := json_schema.get("$ref"):
            assert isinstance(ref, str)
            return self._load_ref(ref)

        type_ = json_schema.get("type")
        if type_ is None:
            warnings.warn("Empty type field in JSON schema, defaulting to string", UserWarning, stacklevel=2)
            return self.tb.string()
        parse_type = {
            "string": lambda: self._parse_string(json_schema),
            "number": lambda: self.tb.float(),
            "integer": lambda: self.tb.int(),
            "object": lambda: self._parse_object(json_schema),
            "array": lambda: self.parse(json_schema["items"]).list(),
            "boolean": lambda: self.tb.bool(),
            "null": lambda: self.tb.null(),
        }

        if type_ not in parse_type:
            raise ValueError(f"Unsupported type: {type_}")

        field_type = parse_type[type_]()

        return field_type


def parse_json_schema(json_schema: Dict[str, Any], tb: TypeBuilder) -> FieldType:
    parser = SchemaAdder(tb, json_schema)
    return parser.parse(json_schema)
