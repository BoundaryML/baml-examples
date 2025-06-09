// Learn more about clients at https://docs.boundaryml.com/docs/snippets/clients/overview

client<llm> Ollama {
  provider ollama
  options {
    base_url "http://localhost:11434/v1"
    model "llama3.1"
    default_role "user"
  }
}

client<llm> OpenAI {
  provider "openai"
  options {
    api_key env.OPENAI_API_KEY
    model "gpt-4o-mini"
    temperature 0.1
  }
}
