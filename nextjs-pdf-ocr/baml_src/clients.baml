client<llm> GPT4 {
  provider openai
  options {
    model gpt-4
    api_key env.OPENAI_API_KEY
  }
}

client<llm> GPT4Turbo {
  provider openai
  options {
    model gpt-4-turbo
    api_key env.OPENAI_API_KEY
  }
}

client<llm> GPT4o {
  provider openai
  options {
    model gpt-4o
    api_key env.OPENAI_API_KEY
  }
}

client<llm> Sonnet35 {
  provider anthropic
  options {
    model claude-3-5-sonnet-20240620
    api_key env.ANTHROPIC_API_KEY
  }
}