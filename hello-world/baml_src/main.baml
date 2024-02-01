generator my_generator {
  language python
  pkg_manager poetry
  python_setup_prefix "poetry run"
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
    input string[]
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


function BoolFunc {
  input bool
  output bool
}

impl<llm, BoolFunc> version1 {
  client GPT4
  prompt #"
    Print a boolean out (true or false). Only print out the boolean, nothing else.:
  "#
}

enum MyEnum {
  A
  B
  C
}

class NestedTypes {
  mybool bool
  mystring string
  myint int
  myfloat float
  mylist string[]
  myenum MyEnum
}
function NestedFunc {
  input string
  output NestedTypes
}

impl<llm, NestedFunc> version1 {
  client GPT4
  prompt #"
    Print an object in json format that follows this schema:
    {#print_type(output)}
  "#
}

function ListFunc {
  input string[]
  output string[]
}

impl<llm, ListFunc> version1 {
  client GPT4
  prompt #"
    Print a list of strings in JSON format
  "#
}

function FreeformFunc {
  input string
  output string
}

impl<llm, FreeformFunc> version1 {
  client GPT4
  prompt #"
    Write a haiku. Separate into new lines.
  "#
}

function EnumFunc {
  input string
  output MyEnum
} 

impl<llm, EnumFunc> version1 {
  client GPT4
  prompt #"
    Print either A, B or C. Nothing else.
  "#
}

function FuncMultiArg {
  input (arg1: string, arg2: NestedTypes)
  output string
}

impl<llm, FuncMultiArg> version1 {
  client GPT4
  prompt #"
    Write a haiku

  "#
}