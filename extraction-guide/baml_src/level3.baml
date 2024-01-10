// This uses nested enums
// https://docs.boundaryml.com/v3/guides/entity_extraction/level3

enum OrderStatus {
  ORDERED
  SHIPPED
  DELIVERED
}

class ProductInfo {
  name string
  cost float?
  order_status OrderStatus
}

class OrderInfoWithProducts {
  id string?
  date string?
  products ProductInfo[]
  total_cost float?
}

function GetOrderInfoWithProducts {
  input Email
  output OrderInfoWithProducts
  default_impl level4
}

impl<llm, GetOrderInfoWithProducts> version1 {
  client GPT4
  prompt #"
    Given the email below:

    Email Subject: {#input.subject}
    Email Body: {#input.body}

    Extract this info from the email in JSON format:
    {#print_type(output)}

    Schema definitions:
    {#print_enum(OrderStatus)}
    
    JSON:
  "#
}
