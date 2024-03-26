
 
enum Category {
    Refund
    @alias("k1")
    @description("Customer wants to refund a product")

    CancelOrder
    @alias("k2")
    @description("Customer wants to cancel an order")

    TechnicalSupport
    @alias("k3")
    @description("Customer needs help with a technical issue unrelated to account creation or login")

    AccountIssue
    @alias("k4")
    @description("Specifically relates to account-login or account-creation")

    Question
    @alias("k5")
    @description("Customer has a question")
}

 
function ClassifyMessage { 
  input string
  output Category
  default_impl version3
}

impl<llm, ClassifyMessage> level1 {
  client GPT4
  prompt #"
    Classify the following INPUT into ONE
    of the following Categories:
    {#print_enum(Category)}

    INPUT: {#input}

    Respond only with the name / identifier. Not any other description.
    Category:
  "#
}
