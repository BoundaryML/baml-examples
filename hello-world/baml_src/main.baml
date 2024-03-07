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
 
/// Takes a title and body, and returns a list of verbs
function ExtractVerbs {
    input string
    /// list of verbs
    output string[]
}


impl<llm, ExtractVerbs> version1 {
  client GPT4
  prompt #"
    Extract the verbs from this INPUT:
 
    INPUT:
    ---
    {#input}
    ---
    {// this is a comment inside a prompt! //}
    Return a {#print_type(output)}.

    Response:
  "#
}
