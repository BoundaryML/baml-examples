from product_comparison import compare_products, compare_products_stream

# Example 1: Smartphones
smartphone1 = """
Name: iPhone 14 Pro
Description: Apple's premium smartphone with the latest A16 Bionic chip, featuring a Dynamic Island display and always-on screen.
Brand: Apple
Price: $999
Features: 48MP main camera, Dynamic Island, Always-on display, A16 Bionic chip, ProMotion 120Hz display, Emergency SOS via satellite
"""

smartphone2 = """
Name: Samsung Galaxy S23 Ultra
Description: Samsung's flagship smartphone with the Snapdragon 8 Gen 2 processor and an integrated S Pen.
Brand: Samsung
Price: $1,199
Features: 200MP main camera, 100x Space Zoom, S Pen included, 5000mAh battery, 6.8-inch Dynamic AMOLED 2X display, 45W fast charging
"""

# Example 2: Laptops
laptop1 = """
Name: MacBook Pro 16"
Description: Professional-grade laptop with Apple Silicon M2 Pro/Max chip offering exceptional performance and battery life.
Brand: Apple
Price: $2,499
Features: M2 Pro/Max chip, Liquid Retina XDR display, 16GB-96GB RAM, Up to 8TB storage, 22-hour battery life, MagSafe charging
"""

laptop2 = """
Name: Dell XPS 17
Description: Premium Windows laptop with large display and powerful Intel processors for creative professionals.
Brand: Dell
Price: $1,949
Features: 12th Gen Intel Core i7/i9, NVIDIA RTX 3060, 17-inch 4K UHD+ display, 16GB-64GB RAM, Up to 2TB SSD, Windows 11 Pro
"""

# Example 3: Wireless Earbuds
earbuds1 = """
Name: Apple AirPods Pro 2
Description: Apple's premium noise-cancelling earbuds with improved sound quality and battery life.
Brand: Apple
Price: $249
Features: Active Noise Cancellation, Transparency mode, Adaptive EQ, Spatial Audio, H2 chip, 6 hours battery (30 with case), Water resistant
"""

earbuds2 = """
Name: Sony WF-1000XM5
Description: Sony's flagship noise-cancelling earbuds with industry-leading sound quality and noise reduction.
Brand: Sony
Price: $299
Features: Best-in-class noise cancellation, LDAC Hi-Res Audio, 8 hours battery (24 with case), Speak-to-chat, Wireless charging, Multipoint connection
"""

def run_comparison_examples():
    print("EXAMPLE 1: SMARTPHONE COMPARISON")
    print("-" * 50)
    smartphone_result = compare_products(smartphone1, smartphone2)
    print(f"Product 1: {smartphone_result.product1.name}")
    print(f"Product 2: {smartphone_result.product2.name}")
    print("\nCOMPARISON:")
    print(smartphone_result.comparison)
    print("\nRECOMMENDATION:")
    print(smartphone_result.recommendation)
    print("\n" + "=" * 80 + "\n")

    print("EXAMPLE 2: LAPTOP COMPARISON")
    print("-" * 50)
    laptop_result = compare_products(laptop1, laptop2)
    print(f"Product 1: {laptop_result.product1.name}")
    print(f"Product 2: {laptop_result.product2.name}")
    print("\nCOMPARISON:")
    print(laptop_result.comparison)
    print("\nRECOMMENDATION:")
    print(laptop_result.recommendation)
    print("\n" + "=" * 80 + "\n")

    print("EXAMPLE 3: EARBUDS COMPARISON (STREAMING)")
    print("-" * 50)
    print("Streaming response:")
    earbuds_result = compare_products_stream(earbuds1, earbuds2)
    print("\nFINAL RESULT:")
    print(f"Product 1: {earbuds_result.product1.name}")
    print(f"Product 2: {earbuds_result.product2.name}")
    print("\nCOMPARISON:")
    print(earbuds_result.comparison)
    print("\nRECOMMENDATION:")
    print(earbuds_result.recommendation)

if __name__ == "__main__":
    run_comparison_examples()
