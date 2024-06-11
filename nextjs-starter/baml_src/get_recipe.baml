class Recipe {
    number_of_servings int @description(#"
        Best estimate
    "#)
    ingredients (PartIngredient[] | Ingredient[]) @description(#"
        Ingredients can be grouped by parts like 'For the sauce' or 'For the dough'
    "#)
    instructions (PartSteps[] | string[]) @description(#"
        Instructions can be grouped by parts like 'For the sauce' or 'For the dough'
    "#)
    serving_tips string[] @description(#"
        Tips for serving the dish
    "#)
}

class PartIngredient {
    title string
    ingredients Ingredient[]
}

class PartSteps {
    title string
    steps string[]
}

class Ingredient {
    name string
    amount float
    unit string
    description string? @description(#"
        Optional description of the ingredient like 'diced' or 'chopped'
    "#)
}  

function GetRecipe(arg: string) -> Recipe {
    client GPT4o
    prompt #"
        Generate a recipe for a {{arg}}.

        {{ ctx.output_format }}
    "#
}

test ApplePie {
    functions [GetRecipe]
    args {
        arg "apple pie"
    }
}

test Shaksuka {
    functions [GetRecipe]
    args {
        arg "shakshuka"
    }
}