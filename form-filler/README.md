# Form Filler Agent

Welcome to the **Form Filler** project! This tutorial will guide you through using BoundaryML (BAML) to leverage large language models (LLMs) for form filling tasks.

## Table of Contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Architecture](#architecture)
- [Usage](#usage)
- [Conclusion](#conclusion)

## Introduction

The Form Filler project uses BAML to interact with various LLMs for extracting and processing information. This tutorial focuses on how to set up and use the LLM components within the architecture.

## Setup

### Prerequisites

- Python 3.10 or higher
- BAML Python package (`baml-py`)
- OpenAI API key

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/form-filler.git
    cd form-filler
    ```

2. Install dependencies (if not using UV):
    ```sh
    pip install -r requirements.txt
    ```

3. Set up environment variables:
    ```sh
    cp .env.example .env
    # Add your API keys to the .env file
    ```

4. Generate Python code from BAML (`baml-cli` comes with the `baml-py` python package)
    ```sh
    baml-cli generate
    ```

    ```sh
    uv run baml-cli generate
    ```

5. Run the app:
    ```sh
    BAML_LOG=warn python -m hello
    ```

    ```sh
    BAML_LOG=warn uv run python -m hello
    ```

## Architecture

The architecture of this project is designed to utilize multiple LLMs through BAML. Below is an overview of the key components:


### baml_src/generators.baml

The generator converts

### baml_src/form_filler.baml

Has the agentic loop defined as a function

## Conclusion

For more information, visit the [BoundaryML documentation](https://docs.boundaryml.com/).
