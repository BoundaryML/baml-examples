// Defining a data model.
class Conference {
  conference_name string
  conference_location string
}

// Note this function is modified at runtime to inject the PDF blob, so that's why there are no inputs
// to this. The function must be ran by running main.py
function ExtractPDF() -> Conference {
  client "openai/gpt-4o" // Set OPENAI_API_KEY to use this client.
  prompt #"
    {{ _.role("user")}}

    Extract from this content:

    {{ ctx.output_format }}
  "#
}


