client<llm> GPT4 {
  provider baml-openai-chat
  options {
    model gpt-4-1106-preview
    api_key env.OPENAI_API_KEY
  }
}

function GetDetailedSentiment {
  input string
  output DetailedSentiment
}

class DetailedSentiment {
  sentiment_score float
  summary string @description("Summary in one word")
}

impl<llm, GetDetailedSentiment> version1 {
  client GPT4
  prompt #"
    What do you think the sentiment of 'text' is?
    text: {#input}

    Answer in JSON format:
    {#print_type(output)}
  "#
}