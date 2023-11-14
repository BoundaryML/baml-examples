generator default {
    language python
}

client<llm> GPT35Client {
    provider baml-openai-chat
    options {
        
        model gpt-3.5-turbo
        temperature 0
        api_key env.OPENAI_API_KEY
    }
}
    
client<llm> GPT4Client {
    provider baml-openai-chat
    options {
        
        model gpt-4
        temperature 0
        api_key env.OPENAI_API_KEY
    }
}

function AnswerPrompt {
    input   (info: string, query: string)
    output  string
}

function PromptType{
    input string
    output string
}
function ClarifyPrompt {
    input  (query: string, response: string[])
    output string
}
impl<llm, PromptType> v1 {
    client GPT4Client
    prompt #"

    Given the following prompt, classify it as a clarification request (1) or a query about new information (2)

        Prompt: {#input}
        
        Output:
    "#
}
impl<llm, ClarifyPrompt> v1 {
    client GPT4Client
    prompt #"

    Given the following clarification prompt and a list of previous responses, clarify the most recent related response

        Prompt: {#input.query}

        Previous Responses: {#input.response}
        
        Output:
    "#
}
impl<llm, AnswerPrompt> v1 {
    client GPT4Client
    prompt #"

    Given the following information, answer the query in 2 to 5 sentences

        Information: {#input.info}
        
        Query: {#input.query}
        
        Output:
    "#
}
