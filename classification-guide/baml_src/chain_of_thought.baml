// https://docs.boundaryml.com/v3/guides/classification/level3
class IntentWithReasoning {
  reasoning_steps string @description(#"
    Some clues and reasoning steps to help the user
    understand why the intent was chosen.
  "#)
  intent Intent @alias(chosen_intent) @description(#"
    The intent identifier or name.
  "#)
}

impl<llm, ClassifyIntent> version3 {
  client GPT4

  // see tutorial for explanation.
  adapter<IntentWithReasoning, output> python#"
     return arg.intent
  "#

  prompt #"
    Classify the following INPUT into the best Intent.

    {#print_enum(Intent)}

    INPUT: {#input}

    Output in this JSON format:
    {#print_type(output)}
    JSON:
  "#
}
