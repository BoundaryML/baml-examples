

class Education {
  school string
  degree string
  year int
}

class Resume {
  name string
  skills string[]
  education Education[]
}

function ExtractResume {
  input (resume_text: string)
  output Resume
}

impl<llm, ExtractResume> version1 {
  client GPT4
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {#input.resume_text}
    ---
    Output in this JSON format:
    {#print_type(output)}

    Output JSON:
  "#
}