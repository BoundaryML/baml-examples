# Survey Bot

From BAML chat: https://dashboard.boundaryml.com/chat/c16Nzy

Survey Bot is a tool designed to manage and analyze survey responses using AI-driven insights. It leverages the BAML client to process survey questions and determine the next steps based on user responses.

## Run Locally

```bash
uv sync
uv run baml-cli generate
uv run hello.py
```

## Components

- **SurveyQuestion**: Represents a survey question with attributes like ID, text, type, and options.
- **Answer**: Captures the response quality and whether follow-up is needed.
- **SurveyStatus**: Tracks the progress of the survey, including completed questions and the next question to ask.

## Key Functions

- **AnalyzeResponse**: Analyzes a given response to a survey question to determine its quality and if follow-up is needed.
- **DetermineNextQuestion**: Decides the next question to ask based on previous answers and the current survey status.

## Usage

The `hello.py` script initializes a survey with predefined questions and processes user responses in a loop until the survey is complete. The `SurveyManager` class handles the survey logic, utilizing the BAML client functions to analyze responses and update the survey status.

To run the survey, execute the `hello.py` script and follow the prompts to answer the questions. The survey will continue until all questions are answered or the survey is marked as complete.
