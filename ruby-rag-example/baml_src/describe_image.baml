
class CharacterDescription {
  name string
  clothingItems string[]
  hairColor string? @description(#"
    The color of the character's hair.
  "#)
  smellDescription string
  spells Spells[]
}

class Spells {
  name string
  description string

}

function DescribeCharacter(first_image: image) -> CharacterDescription {
  client GPT4o
  prompt #"
    {{ _.role("user")}}
    
    Describe the characters in the image:
    {{ first_image }}


    {{ ctx.output_format }}

    Before you answer, explain your reasoning in 3 sentences.
  "#
}
 
test TestName {
  functions [DescribeCharacter]
  args {
    first_image { url "https://upload.wikimedia.org/wikipedia/en/4/4d/Shrek_%28character%29.png"} 
    // second_image { url "https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg"}
  }
}


