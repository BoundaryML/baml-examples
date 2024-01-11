// https://docs.boundaryml.com/v3/guides/classification/level3
class CategoryWithReasoning {
  reasoning_steps string @description(#"
    Some clues and reasoning steps to help the user
    understand why the category was chosen.
  "#)
  category Category @alias(chosen_category) @description(#"
    The category identifier or name.
  "#)
}

impl<llm, ClassifyMessage> version3 {
  client GPT4

  // see tutorial for explanation.
  adapter<CategoryWithReasoning, output> python#"
     return arg.category
  "#

  prompt #"
    Classify the following INPUT into the best Category.

    {#print_enum(Category)}

    INPUT: {#input}

    Output in this JSON format:
    {#print_type(output)}
    JSON:
  "#
}
