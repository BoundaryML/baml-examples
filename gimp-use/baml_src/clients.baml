client<llm> GPT4o {
  provider openai
  options {
    model gpt-4o
    api_key env.OPENAI_API_KEY
  }
}

client<llm> Claude {
  provider anthropic
  retry_policy MyPolicy
  options {
    model claude-3-5-sonnet-20241022
    api_key env.ANTHROPIC_API_KEY
    max_tokens 1000
  }
}

retry_policy MyPolicy {
  max_retries 3
}