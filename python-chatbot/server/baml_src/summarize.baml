function SummarizeMessages(messages: Message[]) -> string {
  client CustomGPT4o
  prompt #"
    You are a helpful chatbot having a conversation with the user.
    That conversation can get long, and you need to summarize it to
    prevent your context from getting too long. Keep only the information
    you expect to need for followup questions.

    If the user says they will never mention something again,
    that thing does not need to be in the summary. You don't
    need to summarize the fact that they will never mention
    in again. Strike it from the record.

    Content:
    {{ messages }}

  "#
}

test Summarize() {
    functions [SummarizeMessages]
    args {
      messages [
        {
          role User
          content "What is the weather in San Francisco?"
          timestamp 1715222400
        },
        {
          role Assistant
          content "The weather in San Francisco is sunny and warm."
          timestamp 1715222401
        }
      ]
    }
    @@assert( {{ this|regex_match("San Francisco")}})
}

test Disregard() {
  functions [SummarizeMessages]
  args {
    messages [
      {
        role User
        content "I promise I will talk about juggling later, and I'm mentioning Baseball now, but I will never ask about it again."
        timestamp 1715222400
      },
      {
        role Assistant
        content "Ok"
        timestamp 1715222401
      }
    ]
  }
  @@assert( {{ this|regex_match("baseball") == false }})
}