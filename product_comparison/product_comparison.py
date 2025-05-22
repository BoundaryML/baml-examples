import os
from dotenv import load_dotenv
from baml_client.sync_client import b
from baml_client.types import Product_comparison_response

# Load environment variables from .env file
load_dotenv()

def compare_products(product1: str, product2: str) -> Product_comparison_response:
    """
    Compare two products and return a structured comparison.
    
    Args:
        product1 (str): Description of the first product
        product2 (str): Description of the second product
        
    Returns:
        Product_comparison_response: Structured comparison with details of both products
    """
    # BAML's internal parser guarantees CompareProducts
    # to always return a Product_comparison_response type
    response = b.CompareProducts(product1, product2)
    return response

def compare_products_stream(product1: str, product2: str) -> Product_comparison_response:
    """
    Compare two products with streaming response.
    
    Args:
        product1 (str): Description of the first product
        product2 (str): Description of the second product
        
    Returns:
        Product_comparison_response: Final structured comparison with details of both products
    """
    stream = b.stream.CompareProducts(product1, product2)
    for msg in stream:
        print(msg)  # This will be a partial response
    
    # This will be a Product_comparison_response type
    final = stream.get_final_response()
    
    return final


