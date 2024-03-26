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

  prompt #"
    Classify the following INPUT into the best Category.

    {#print_enum(Category)}

    INPUT: {#input}

    Before you choose the answer, please provide some reasoning steps as to why it matches.

    Write the answer in the last line.
  "#
}
