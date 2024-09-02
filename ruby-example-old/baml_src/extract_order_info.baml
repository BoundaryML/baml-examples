// In this example we tell the model to think step by step and explain its reasoning
// before outputting the answer.

// Run this prompt, and you'll notice the BAML function still returns the expected return type (OrderInfo),
// even though there is a bunch of "reasoning" text present (see View Raw Output toggle). It works with streaming or even standalone enum outputs too!
class Email {
    subject string
    body string
    from_address string
}

enum OrderStatus {
    ORDERED
    SHIPPED
    DELIVERED
    CANCELLED
}

class OrderInfo {
    order_status OrderStatus
    tracking_number string?
    estimated_arrival_date string?
}

function ExtractOrderInfo(email: Email) -> OrderInfo {
  client GPT4Turbo
  prompt #"
    Given the email below:

     --- 
    from: {{email.from_address}}
    Email Subject: {{email.subject}}
    Email Body: {{email.body}}
    ---

    Extract this info from the email in JSON format:
    {{ ctx.output_format }}
  "#
}