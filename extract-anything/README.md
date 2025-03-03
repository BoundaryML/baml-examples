# Extract Anything

BAML can be leveraged to build a pipeline that can extract anything
without knowing the schema in advance.

This is done via 2 steps:

1. Ask an LLM to describe a schema that could represent the content of the document.

2. Use the schema to extract the content by leveraging dyanmic types.

## Architecture

Backend is python + FASTAPI + BAML

Frontend is React

We try and stream whatever possible!
