class Guide {
    // request_type 
    related_topics Query[] @description(#"
        more refined (around 4) to make a user more likely to find the information they need.
    "#)
    packaging_instructions string[]
    processing_instructions string[]
}

class Query {
    category "packaging" | "processing"
    phrase string
}

function GenerateGuide(arg:string) -> Guide {
    client "openai/gpt-4o-mini"
    prompt #"
        You are helping some one understand details about the industrial scale manufacturing process of a product. 

        This will include details about the process, the materials used, the equipment used, and the steps involved.

        {{ ctx.output_format }}

        {{ _.role('user') }}
        User Request: {{ arg }}
    "#
}

test TestName {
  functions [GenerateGuide]
  args {
    arg #"
      beef jerky
    "#
  }
}
