class Product {
    name string
    description string
    brand string
    price string
    features string[]
}

class Product_comparison_response {
    product1 Product
    product2 Product
    comparison string
    recommendation string

}


function CompareProducts(product1: string, product2: string) -> Product_comparison_response {
    client "openai/gpt-4o"
    prompt #"
        Compare the following two products:
        Product 1: {{ product1 }}
        Product 2: {{ product2 }}
        
        {{ ctx.output_format }}
    "# 
}
test product_comparison {
    functions [CompareProducts]
    args {
        product1 #"
            Name: iPhone 14
            Description: Latest Apple smartphone with A15 Bionic chip.
            Brand: Apple
            Price: $999
            Features: 5G, Face ID, Dual Camera
        "#

        product2 #"
            Name: Samsung Galaxy S22
            Description: Flagship Samsung smartphone with Exynos 2200.
            Brand: Samsung
            Price: $799
            Features: 5G, In-display fingerprint sensor, Triple Camera
        "# 
    }
}