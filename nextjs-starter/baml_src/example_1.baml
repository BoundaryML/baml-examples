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
  "#
}

test sarah {
  functions [ExtractResume]
  args {
    raw_text #"
      Sarah Montez
      Harvard University
      May 2015-2019
      3.92 GPA
      Google
      Software Engineer
      June 2019-Present
      - Backend engineer
      - Rewrote search and uplifted metrics by 120%
      - Used C++ and Python
      Microsoft
      Software Intern
      June 2018-August 2018
      - Worked on the Windows team
      - Updated the UI
      - Used C++  
    "#
  }
} 

test jason {
  functions [ExtractResume]
  args {
    raw_text #"
    Jason Doe
    Python, Rust
    University of California, Berkeley, B.S.
    in Computer Science, 2020
    Also an expert in Tableau, SQL, and C++
    "#
  }
}