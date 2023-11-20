generator default {
    language python
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

enum ClassifyPrompt {
    CLARIFICATION @alias("clarification") @description("If the query is a clarification request")
    INFO @alias("info") @description("If the query is request new information")
}

function PromptType{
    input string
    output ClassifyPrompt
}
function ClarifyPrompt {
    input  (query: string, response: string, info: string)
    output string
}
impl<llm, PromptType> v1 {
    client GPT4Client
    prompt #"

    Given the following prompt, classify it as a clarification request or a query about new information

        Prompt: {#input}
        
        Please return one of the following classes:
        {#print_enum(ClassifyPrompt)}
    "#
}
impl<llm, ClarifyPrompt> v1 {
    client GPT4Client
    prompt #"

    Answer the following clarification query appropriately given the response the query is about. The information the response was generated from is also provided.

        Prompt: {#input.query}

        Response: {#input.response}

        Information: {#input.info}
        
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
