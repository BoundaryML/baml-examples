generator Default {
    language "python"
    project_root "../"
    test_command "poetry run python -m pytest"
    install_command "poetry add baml@latest"
    package_version_command "poetry show baml"
}

client<llm> GPT4 {
  provider baml-openai-chat
  options {
    // Add any params the openai client takes in here
    model gpt-4-1106-preview
    api_key env.OPENAI_API_KEY
  }
} 
 