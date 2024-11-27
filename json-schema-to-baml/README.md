# JSON Schema to BAML

A Python utility that converts JSON Schema definitions to BAML types for use with the BAML functions.

[BAML](https://www.github.com/boundaryml/baml)
[BAML Dyanmic Types](https://docs.boundaryml.com/guide/baml-advanced/dynamic-runtime-types)

## Overview

This tool allows you to automatically convert Pydantic models and their JSON schemas into BAML types, making it easy to use your existing data models with BAML's LLM functions.

⚠️ This is just sample code! You can copy and paste the library in your own codebase and modify as needed.

## Installation

```bash
# Install using pip
pip install json-schema-to-baml

# Install dependencies
pip install -r requirements.txt
```

```bash
# Install using uv
uv sync
```

### Generate the baml_client

Using uv:

```bash
uv run baml-cli generate
```

If you installed via pip:

```bash
baml-cli generate
```

## Run

Next make sure you add a .env file, and you can run this script:

```bash
uv run dotenv run python test_one.py
```

```bash
dotenv run python test_one.py
```

## Understanding the Code

```python
# my_types.py
# File containing your Pydantic model
from pydantic import BaseModel
from enum import Enum

class Gender(str, Enum):
  male = 'male'
  female = 'female'
  other = 'other'
  not_given = 'not_given'

class MainModel(BaseModel):
  name: str
  age: int
  gender: Gender | None = None
```

```python
from baml_client.type_builder import TypeBuilder
from json_schema_to_baml import parse_json_schema
# Create a type builder
tb = TypeBuilder()

# Convert your model's JSON schema to BAML types
from my_types import MainModel
schema = MainModel.model_json_schema()
baml_type = parse_json_schema(schema, tb)
```

```rust
// baml_src/example.baml
class DynamicContainer {
  @@dynamic
}
```

```python
from baml_client import b
# Add the type to your BAML Type annotated with `@@dyanamic`
tb.DyanamicContainer.add_property("data", baml_type)
# Use in BAML function calls
response = b.ExtractDynamicTypes(text, {"tb": tb})
# Parse the response
result = MainModel.model_validate(response.data)

# result.data is now a key-value pair that should work with your Pydantic model
# This will always work!
parsed = MainModel.model_validate(result.data)
```

```bash
# Required environment variables
OPENAI_API_KEY=your_openai_key_here
```
