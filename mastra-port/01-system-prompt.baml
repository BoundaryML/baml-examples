// https://mastra.ai/en/examples/agents/system-prompt

class CatFact {
    fact string
    length int
}

function getCatFact() -> CatFact {
    std::fetch_value<CatFact>(std::Request {
        base_url: "https://catfact.ninja/fact",
        method: "GET",
        query_params: {},
        body: null,
    })
}

function RespondToUser(query: string) -> string {
    let cat_fact: CatFact = getGatFact();
    LlmResponse(query, cat_fact)
}

function LlmResponse(query: string, cat_fact: CatFact) -> string {
    client GPT4o
    prompt #"
        {{ _.role = "system" }}

        You are a helpful cat expert assistant. Respond to the user's query,
        integrating the given cat fact if cats are part of the query.

        {{ _.role = "user" }}
        Cat fact: {cat_fact.fact}
        User query: {query}

    "#
}

// Observations:
//
//  - Mastra expresses this as an agent, with a slightly different prompt:
//    "When discussing cats, you should always include an interesting cat fact."
//
//  - Since Mastra is using its default agent, it automatically handles memory
//    of previous queries and the LLMs responses, while our function does not.
//
//  - When using Mastra's memory, it's necessary to attach a `resourceId` to each
//    query. This associates each query with a specific user, allowing Mastra to
//    manage the memory (as opposed to each client holding its own copy of
//    the memory).
//
//  - This example calls getCatFact() unconditionally. But it would have been
//    possible to factor the workflow into two LLM calls, with the first one
//    determining whether a cat fact is necessary.

function NeedsCatFact(query: string) -> bool {
    client GPT4o
    prompt #"
        {{ _.role = "user" }}
        Is the following query about cats?

        {{ _.role = "user" }}
        {query}

        {{ ctx.output_format }}

    "#
}

function RespondToUserV2(query: string) -> string {
    let fact = NeedsCatFact(query) ? getCatFact() : null;
    LlmResponse(query, fact)
}

// - If we wanted to store the chat history, we would require either:
//   - The client puts all queries and responses onto a State, or
//   - We allow the user to modify state in their BAML function, and the
//     BAML function returns both the response and the updated state, so that
//     the client has access to the updated state to pass with the next query.