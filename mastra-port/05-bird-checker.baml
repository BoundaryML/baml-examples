// https://mastra.ai/en/examples/agents/bird-checker

// This is another Agent that is more like a simple LLM function.

class BirdInfo {
    bird bool @description("Whether the image contains a bird")
    species string? @description("Scientific name of the bird, with no other information")
    location string? @description("Shord description of the location that a high-schooler could understand")
}

function BirdChecker(image: Image) -> BirdInfo {
    client GPT4o
    prompt #"
        You are an aereal herpetologist. Check out this image:
        {{ image }}

        {{ ctx.output_format }}
    "#
}