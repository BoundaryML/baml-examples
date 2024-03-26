
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