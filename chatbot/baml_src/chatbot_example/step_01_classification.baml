
// Refer to https://docs.boundaryml.com/v3/guides/classification/level1
// for a step-by-step example
// Step 1: Classify the users intent as one of:
// * Book a meeting
// * Ask about our availability
// * Set a reminder

// 1. Define an enum which represents the users intent
enum Intent {
  BookMeeting
  AvailabilityQuery
  SetReminder
}

// Define a function which takes a string and returns any of the intents 
function ClassifyIntent {
  input (query: string)
  output Intent[]

  // Later in this file, we'll define two implementations of this function.
  // So for now, we'll mark the simple one as the default.
  default_impl simple
}


// Now we implement the function, using an llm.
impl<llm, ClassifyIntent> simple {
  // This is the name of the client, which is used to execute this impl.
  // See ./clients.baml file for more details.
  client Main

  prompt #"
    Given the question, which of the intents is the user attempting to do?

    Question:
    ```
    {#input.query}{// you can refer to the query value in the prompt here//}
    ```

    {#print_enum(Intent)}{// we use printers to print out each enum value automatically. //}

    Output JSON: {#print_type(output)}{// we use printers to print out the output type automatically. //}

    JSON:
  "#

  // Note, even though an LLM returns a string, we parse it into our array of Intents
  // automatically.
}


python#"
# To call this function in python, you could do something like this:
from baml_client import baml

async def some_function(input: str):
  # Note all baml functions are fully typed.
  # You get autocomplete and type checking for free.
  
  intents = await baml.ClassifyIntent(query=input)
  # intents is of type: List[Intent]
  print(intents)
"#



impl<llm, ClassifyIntent> advanced {
  client Main
  
  // Lets say, we want the LLM to call it "book_a_meeting" instead of "BookMeeting"
  // We can do that by defining a mapping from the enum to the string, but only
  // localize that mapping to this version of the function.
  override Intent {
    BookMeeting @alias(k1)
    @description(#"
      When the user wants to book a meeting
    "#)

    AvailabilityQuery 
    @alias(k2)
    @description(#"
      When the user is asking about their calendar availability
    "#)

    SetReminder @alias(k3)
    @description(#"
      When the user wants to set a reminder
    "#)

    // You can even rename the type of the enum.
    @@alias(User Intent)
  }

  // Notice the prompt is the same as simple, but the implementation is different
  // due to the override above.
  // Even we serialized the enum differently, we still parse the LLM response into the
  // same enum array (Intent[]), meaning you can change the implementation without
  // impacting the rest of your code.
  prompt #"
    Given the question, which of the intents is the user attempting to do?

    Question:
    ```
    {#input.query}
    ```

    {#print_enum(Intent)}

    Output JSON: {#print_type(output)}

    JSON:
  "#

}


python#"
# To use the 'advanced' impl instead of 'simple', you have two options:

# Option 1. Change the default_impl to 'advanced' in this baml file.
# no need to change python code.
async def my_function(input: str) -> typing.List[Intent]:
  return await baml.ClassifyIntent(query=input)

# Option 2. Specify the impl in your python code.
# This is useful if you want to use different impls in different places.
async def my_function(input: str) -> typing.List[Intent]:
  return await baml.ClassifyIntent.get_impl('advanced').run(query=input)
"#
