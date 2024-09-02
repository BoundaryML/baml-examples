enum Category {
    Refund
    CancelOrder
    TechnicalSupport
    AccountIssue
    Question
}

class MessageFeatures {
    categories Category[]
}

function ClassifyMessage(input: string) -> MessageFeatures {
  client GPT4Turbo

  prompt #"
    {# _.chat("system") starts a system message #}
    {{ _.chat("system") }}

    Classify the following INPUT.

    {{ ctx.output_format }}

    {# This starts a user message #}
    {{ _.chat("user") }}

    INPUT: {{ input }}

    Response:
  "#
}