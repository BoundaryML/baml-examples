import asyncio
from baml_client.types import WeatherReport
from .utils import unix_now

# TODO: Implement these tools.

async def get_weather(location: str) -> WeatherReport:
    await asyncio.sleep(1.0)
    return WeatherReport(temperature=70, precipitation=0, timestamp=unix_now())

async def compute_value(expression: str) -> float:
    # Ensure the expression is safe to evaluate
    import re
    
    # Check if expression only contains allowed characters
    allowed_pattern = r'^[0-9\+\-\*\/\^\(\)\s\.]+$'
    if not re.match(allowed_pattern, expression):
        raise ValueError("Expression contains invalid characters. Only numbers, basic operators (+,-,*,/,^), parentheses, and spaces are allowed.")
    
    # Replace ^ with ** for exponentiation
    expression = expression.replace('^', '**')

    return eval(expression)