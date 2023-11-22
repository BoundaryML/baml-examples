# baml-examples

## Overview
The purpose of this project is to demonstrate how baml can be used to help design an OpenAI chatbot on user-inputted content. The user can upload a pdf containing the desired topic inside the pdfs directory, where it will be turned into embeddings (by paragraph) for the LLM to more easily answer queries. Once these embeddings are generated, a user can ask either 1) a topic-specific query, for which the embeddings will also be generated, or 2) a clarification request for the previous response. For the first type of request, the 10 closest embeddings from the pdf to the query will be inputted as information for the LLM to use to answer the query. For the second type of request, the previous response and the previous information that the response was based on is inputted into the LLM in order to clarify the previous reponse accordingly. This comparison of embeddings to find the content most relevant to the query is commonly used in Retrieval Augmented Generation (RAG), which is a technique that helps LLMs better respond to prompts.

## What Is Baml?
Baml is a powerful tool that can be used to more easily query LLMs in a desired format. Upon building a baml file, python files are automatically generated that can query the LLM, which reduces a lot of the hassle from a programmer standpoint. In this project, there is a main.baml file within the baml_src folder. There are 3 functions: PromptType, AnswerPrompt, and ClarifyPrompt; PromptType will determine if the prompt is a clarification question or a question about new information, AnswerPrompt will answer the prompt based on the inputted information, and ClarifyPrompt will clarify the previous response based on the information used to generate that response. A GPT4Client is used to answer all prompts. You can read more about Baml [here](https://docs.trygloo.com/v2/mdx/overview)

## How to Run
As a prerequisite, Baml and Poetry must be installed. Instructions on how to setup Baml in VSCode can be found [here](https://docs.trygloo.com/v2/mdx/installation). Instructions on how to install poetry can be found [here](https://python-poetry.org/docs/). You also need an OpenAI key in order to have access to GPT4. If you do not have GPT4, you can use GPT3.5, but you will need to replace the GPT4Client (and all of its occurences) in the main.baml file. You can create a GPT35Client as follows:
```
client<llm> GPT35Client {
    provider baml-openai-chat
    options {
      model gpt-3.5-turbo
      temperature 0
      api_key env.OPENAI_API_KEY
    }
}
```
Then, you must create a .env file with the following content (this applies to both GPT4 and GPT3.5 clients):
```
OPENAI_API_KEY='YOUR_OPENAI_API_KEY'
```

After those are setup, upload a pdf(s) with the information you wish to query in the pdfs folder, and delete all other irrelevant pdfs. Now, the project can be run by doing the following:
Install necessary dependencies:
```
poetry install
```
Spawn a shell with the virtual environment activated:
```
poetry shell
```
Run the project:
```
python -m app.main
```

