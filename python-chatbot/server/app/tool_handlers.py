import asyncio
from baml_client.types import WeatherReport
from .utils import unix_now
import requests
import logging
from typing import Optional
logger = logging.getLogger(__name__)

async def get_weather(location: str) -> Optional[WeatherReport]:
    """Get the weather for a given location."""
    try:
        geocodingData = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json")
        geocodingData.raise_for_status()
        geocodingData = geocodingData.json()
        logger.info(f"Geocoding data: {geocodingData}")
        latitude = geocodingData["results"][0]["latitude"]
        longitude = geocodingData["results"][0]["longitude"]

        weatherData = requests.get(f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&timezone=auto")
        weatherData.raise_for_status()
        weatherData = weatherData.json()
        logger.info(f"Weather data: {weatherData}")
        temperature = weatherData["current_weather"]["temperature"]
        weathercode = weatherData["current_weather"]["weathercode"]
        weather_status = weather_code_to_description(weathercode)
        return WeatherReport(location=location, temperature=int(temperature), weather_status=weather_status, timestamp=unix_now())
    except Exception as e:
        logger.error(f"Error getting weather: {e}")
        return None


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

def weather_code_to_description(code: int) -> str:
    """Convert a weather code to a description."""
    try:
        description = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy", 
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle", 
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Slight or moderate thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }[code]
        return description
    except KeyError:
        return "Unknown"
