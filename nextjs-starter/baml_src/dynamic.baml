class Person {
  @@dynamic
}

function ExtractPerson(input: string) -> Person {
  client GPT4o
  prompt #"
    Extract from this input:
    {{ input }}

    {{ ctx.output_format }}
  "#
}