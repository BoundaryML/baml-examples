class Resume {
  name string
  education Education[]
  skills string[]
}

class Education {
  school string
  degree string
  year int
} 
 
  
function ExtractResume(raw_text: string) -> Resume {
  client GPT4
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {{raw_text}}
    ---

    Output JSON format (only include these fields, and no others):
    {{ ctx.output_format(prefix=null) }}

    Output JSON:
  "#
}

test TestName {
  functions [ExtractResume]
  args {
    raw_text #"
      John Doe
      Education
      ---
      University of California, Berkeley
      B.S. in Computer Science
      2010
      ---
      Skills
      ---
      Java
      Python
      C++
      ---
    "#
  }
}
