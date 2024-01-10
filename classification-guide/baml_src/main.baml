// This is the final extraction file

generator my_generator {
  language python
  pkg_manager poetry
}

client<llm> GPT4 {
  provider baml-openai-chat
  options {
    // Add any params the openai client takes in here
    model gpt-4-1106-preview
    api_key env.OPENAI_API_KEY
  }
}

enum Intent {
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

 
function ClassifyIntent { 
  input string
  output Intent
  default_impl level1
}

impl<llm, ClassifyIntent> level1 {
  client GPT4
  prompt #"
    Classify the following INPUT into ONE
    of the following Intents:
    {#print_enum(Intent)}

    INPUT: {#input}

    Respond only with the name / identifier. Not any other description.
    Intent:
  "#
}

// Overrides are currently not supported well:
// impl<llm, ClassifyIntent> level2 {
//   client GPT4

//   override Intent {
//     TechnicalSupport
//     @alias("technical-support")
//     @description("Customer needs help with a technical issue unrelated to account creation")

//     AccountIssue
//     @alias("account-issue")
//     @description("Specifically relates to account-creation")

//     Question
//     @skip
//   }

//   prompt #"
//     Classify the following INPUT into ONE
//     of the following Intents:

//     {#print_enum(Intent)}

//     INPUT: {#input}

//     Respond only with the name / identifier. Not any other description.
//     Intent:
//   "#
// }