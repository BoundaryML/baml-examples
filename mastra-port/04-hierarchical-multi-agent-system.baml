// https://mastra.ai/en/examples/agents/hierarchical-multi-agent

// This is an odd example. Two of the Agents they build consist
// of a sigle static LLM function. The final one, the Orchestrator
// agent, simply calles the first two in series. There is nothing
// agentic, and it is trivial to implement in a BAML workflow.

function CopyWriter(topic: string) -> string {
    client Claude
    prompt #"
        Create a blog post about {{ topic }}.
    "#
}

function Editor(content: string) -> string {
    client GPT4o
    prompt #"
        Edit the followincg blog post only returning the edited copy:
        {{ content }}
    "#
}

function InferTopic(query: string) -> string? {
    client Claude
    prompt #"
        Given the user's query, infer the blog post topic
        they would like you to write about:

        Query: {{ query }}

        {{ ctx.output_format }}
    "#
}

function Publisher(query: string) -> string {
    if let topic = InferTopic(query) {
        let draft = CopyWriter(topic);
        Editor(draft)
    } else {
        "I'm sorry, I couldn't infer a topic for your query."
    }
}

// Observations:
//
//  - Because Mastra defines these as agents, the Publisher in
//    Mastra does not need any logic to infer the desired topic
//    nor an input parameter for the query. The agent is always
//    assumed to be a chatbot-like interface, for better or worse.
//    In consrast, BAML considers publication of a blog post from
//    a query to be a linear workflow. We take control of
//    the LLM function that infers a topic from the query, and
//    hand the topic to a CopyWriter function.
//
//  - Mastra has another copy of this example, using Workflows
//    instead of Agents, and indeed the workflow is triggered
//    by a topic (rather than a query):
//    Workflow( triggerSchema ).step(copyWriter).step(editor).commit()