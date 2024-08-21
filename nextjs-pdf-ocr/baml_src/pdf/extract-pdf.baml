


template_string SchemaGuidelines() #"
  Available types:
    - class (mentioned above)
    - string[], int[], float[]
    - float
    - bool
    - unions can be represented as "ClassA | ClassB"
    - optionals have a question mark: e.g. "property string?"
    - enums in this format:
      enum MyEnum {
        VALUE1
        // a random comment
        VALUE2 @description("Also optional description")
        VALUE3
      }

    Not available:
    - Recursive types are not supported.
    - inline definitions are not allowed. you must declare a class for anything nested.
    - Enums must also be declared separately, not inline.

    Any freeform text goes in double slash:
    // like this.
"#

function PDFGenerateBAMLSchema(pdf: image[]) -> string {
  client Sonnet35
  prompt #"
    {{ _.role("user") }}

    Extract the schema of this PDF in this kind of format:

    For objects you want to reuse in the schema, use this syntax:
    ```
    class MyObject {
      // the @description is optional, and it goes AFTER the field you're trying to describe.
      property string @description("some description")
      property2 float @description("another example")
    }
    ```

    Make sure to write a "class OutputSchema" that contains the final schema representation.
 
    Be thorough, and ensure that every piece of data is accounted for in the schema. If there's a paragraph of text, just add a 1-2 sentence summary in the output schema.

    Don't add any logos or raw base64 images to the output schema.

    If there is a box number of some sort. Indicate that in the @description.

    Add comments about each section you're processing before you write out the class using "//"
 
    {{ SchemaGuidelines() }}

    PDF:
    {{ pdf }}
 
    Answer only in the BMAL format. Use comments for any freeform text:
  "#
}


function PDFFixLinterError(schema: string, linterError: string) -> string {
  client Sonnet35
  prompt #"
    You are fixing linter errors for this new language called BAML.

    Adjust the schema to fix the errors. Do NOT remove any semantic information.
    {{ SchemaGuidelines() }}

    LINTER_ERROR:
    ---
    {{ linterError }}
    ---

    FILE TO FIX:
    ---
    {{ schema }}
    ---
  "#
}



enum Changes {
  CHANGES_NEEDED
  NO_CHANGES
}
class Revision {
  changes string[] @description("List of changes that need to be made.")
  summary Changes
}

function ReviseSchema(pdf: image, schema: string) -> Revision {
  client Sonnet35
  prompt #"
    Given this image, and the proposed schema that that can be used to extract the data, indicate if there are any changes needed, like for example, a field was missed or is not actually present.
    Before you answer explain why.

    Be thorough.

    {{ SchemaGuidelines() }}

    PROPOSED SCHEMA:
    {{ schema }}
    {{ pdf }}

    Tell me the changes in this format: {{ ctx.output_format }}
  "#
}
   
function PDFMakeChange(pdf: image, schema: string, changesNeeded: string) -> string {
  client Sonnet35
  prompt #"
    Given this PDF, and the proposed schema used to be able to extract the changes, there was some feedback that changes were needed. Using that feedback, revise and return the schema with the new changes.

    PROPOSED_SCHEMA: 
    ---
    {{ schema }}
    ---

    {{ SchemaGuidelines }}

    {{ pdf }}
  "#
}



function PDFGenerateSections(pdf: image) -> string {
  client Sonnet35
  prompt #"
    Generate the top-level structure we should pay attention from this form / PDF.

    Be thorough.

    {{ pdf }}
  "#
}

test GenerateBAMLSchemaTest {
  functions [PDFGenerateBAMLSchema]
  args {
    pdf [{
      file ../files/california-tax-form-empty/page1.png
    }]
  }
}