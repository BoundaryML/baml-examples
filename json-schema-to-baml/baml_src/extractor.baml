// Defining a data model.
class DynamicContainer {
  @@dynamic
}

function ExtractDynamicTypes(resume: string) -> DynamicContainer {
  // Set OPENAI_API_KEY to use this client.
  client CustomGPT4oMini
  prompt #"
    {{ ctx.output_format }}

    {{ _.role('user') }}
    Extract from this content:
    {{ resume }}

  "#
}

test TestName {
  functions [ExtractDynamicTypes]
  args {
    resume #"
      hello world
    "#
  }
}
