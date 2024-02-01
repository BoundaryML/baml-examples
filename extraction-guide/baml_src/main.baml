// This is the final extraction file

generator my_generator {
  language python
  pkg_manager poetry
}

client<llm> GPT4 {
  provider baml-openai-chat
  options {
    // Add any params the openai client takes in here
    model gpt-3.5-turbo
    api_key env.OPENAI_API_KEY
  }
}

class Email {
  subject string
  body string
}

class OrderInfo {
  id string?
  @alias("order_id")
  @description("The id of the order")
  date string?
  @description("The date the order was placed in ISO8601 format")
  product_name string?
  @description("The name of the first product listed")
  cost float?
  @description("The cost, in dollars, without currency symbols.")
}

function GetOrderInfo {
  input Email
  output OrderInfo
  default_impl level1
}

impl<llm, GetOrderInfo> level1 {
  client GPT4
  prompt #"
    Given the email below:

    Email Subject: {#input.subject}
    Email Body: {#input.body}

    Extract this info from the email in JSON format:
    {#print_type(output)}

    JSON:
  "#
} 

function Hello {
  input string
  output string
  default_impl level1
}

impl<llm, Hello> level1 {
  client GPT4
  prompt #"
    Generate a sentence about {#input}.
  "#
}

impl<llm, Hello> level2 {
  client GPT4
  prompt #"
    Generate a haiku about {#input}.
  "#
}
