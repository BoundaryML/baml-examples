import asyncio
from baml_client.types import WeatherReport
from .utils import unix_now
import requests
import logging
from typing import Optional
import random
import os

logger = logging.getLogger(__name__)

# Mock weather data for common cities
MOCK_WEATHER_DATA = {
    # US Cities
    "new york": {"temp_range": (10, 30), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Overcast"]},
    "nyc": {"temp_range": (10, 30), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Overcast"]},
    "san francisco": {"temp_range": (12, 22), "common_weather": ["Foggy", "Partly cloudy", "Clear sky", "Overcast"]},
    "sf": {"temp_range": (12, 22), "common_weather": ["Foggy", "Partly cloudy", "Clear sky", "Overcast"]},
    "los angeles": {"temp_range": (15, 30), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy"]},
    "la": {"temp_range": (15, 30), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy"]},
    "chicago": {"temp_range": (0, 28), "common_weather": ["Overcast", "Clear sky", "Slight snow fall", "Partly cloudy"]},
    "seattle": {"temp_range": (5, 22), "common_weather": ["Overcast", "Slight rain", "Moderate rain", "Foggy"]},
    "miami": {"temp_range": (20, 35), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain showers", "Thunderstorm"]},
    "boston": {"temp_range": (5, 28), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Slight snow fall"]},
    "austin": {"temp_range": (15, 38), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy", "Thunderstorm"]},

    # European Cities
    "london": {"temp_range": (5, 20), "common_weather": ["Overcast", "Slight rain", "Moderate rain", "Partly cloudy"]},
    "paris": {"temp_range": (5, 25), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Overcast"]},
    "berlin": {"temp_range": (0, 24), "common_weather": ["Overcast", "Partly cloudy", "Clear sky", "Slight rain"]},
    "rome": {"temp_range": (8, 32), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy"]},
    "madrid": {"temp_range": (5, 35), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy"]},
    "amsterdam": {"temp_range": (5, 22), "common_weather": ["Overcast", "Slight rain", "Partly cloudy", "Foggy"]},

    # Asian Cities
    "tokyo": {"temp_range": (8, 28), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Overcast"]},
    "beijing": {"temp_range": (-5, 35), "common_weather": ["Clear sky", "Overcast", "Foggy", "Partly cloudy"]},
    "singapore": {"temp_range": (24, 32), "common_weather": ["Partly cloudy", "Thunderstorm", "Slight rain showers"]},
    "mumbai": {"temp_range": (20, 35), "common_weather": ["Clear sky", "Partly cloudy", "Moderate rain", "Heavy rain"]},
    "dubai": {"temp_range": (20, 45), "common_weather": ["Clear sky", "Mainly clear", "Partly cloudy"]},
    "seoul": {"temp_range": (0, 30), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Slight snow fall"]},

    # Other Cities
    "sydney": {"temp_range": (15, 30), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Mainly clear"]},
    "moscow": {"temp_range": (-10, 25), "common_weather": ["Overcast", "Slight snow fall", "Clear sky", "Partly cloudy"]},
    "toronto": {"temp_range": (-5, 28), "common_weather": ["Clear sky", "Partly cloudy", "Slight snow fall", "Overcast"]},
    "mexico city": {"temp_range": (12, 26), "common_weather": ["Partly cloudy", "Clear sky", "Slight rain showers"]},
}

# Default weather for unknown locations
DEFAULT_WEATHER = {"temp_range": (10, 25), "common_weather": ["Clear sky", "Partly cloudy", "Slight rain", "Overcast"]}

async def get_weather(location: str) -> Optional[WeatherReport]:
    """Get the weather for a given location.

    If USE_MOCK_WEATHER env var is set or API fails, returns mock data.
    Otherwise attempts to use the real weather API.
    """
    # Add a 2-3 second delay to showcase loading state
    delay = random.uniform(2.0, 3.0)
    logger.info(f"Simulating weather API delay of {delay:.2f} seconds")
    await asyncio.sleep(delay)

    use_mock = os.getenv("USE_MOCK_WEATHER", "true").lower() == "true"

    if not use_mock:
        try:
            # Try real API first
            geocodingData = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json", timeout=3)
            geocodingData.raise_for_status()
            geocodingData = geocodingData.json()

            if not geocodingData.get("results"):
                logger.info(f"Location not found via API, using mock data for {location}")
                use_mock = True
            else:
                latitude = geocodingData["results"][0]["latitude"]
                longitude = geocodingData["results"][0]["longitude"]

                weatherData = requests.get(
                    f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&timezone=auto",
                    timeout=3
                )
                weatherData.raise_for_status()
                weatherData = weatherData.json()

                temperature = weatherData["current_weather"]["temperature"]
                weathercode = weatherData["current_weather"]["weathercode"]
                weather_status = weather_code_to_description(weathercode)

                logger.info(f"Real weather for {location}: {temperature}°C, {weather_status}")
                return WeatherReport(
                    location=location,
                    temperature=int(temperature),
                    weather_status=weather_status,
                    timestamp=unix_now()
                )
        except Exception as e:
            logger.warning(f"Weather API failed, using mock data: {e}")
            use_mock = True

    if use_mock:
        # Use mock data
        location_key = location.lower().strip()

        # Check if we have specific mock data for this location
        weather_info = MOCK_WEATHER_DATA.get(location_key, DEFAULT_WEATHER)

        # Generate random but consistent weather for the same location
        # Use location as seed for consistent results in the same session
        random.seed(f"{location_key}_{unix_now() // 3600}")  # Changes every hour

        temperature = random.randint(*weather_info["temp_range"])
        weather_status = random.choice(weather_info["common_weather"])

        # Add some variation based on time of day
        import datetime
        hour = datetime.datetime.now().hour
        if 6 <= hour < 12:  # Morning - slightly cooler
            temperature -= 2
        elif 12 <= hour < 18:  # Afternoon - warmer
            temperature += 3
        elif 22 <= hour or hour < 6:  # Night - cooler
            temperature -= 5

        logger.info(f"Mock weather for {location}: {temperature}°C, {weather_status}")
        return WeatherReport(
            location=location.title(),
            temperature=temperature,
            weather_status=weather_status,
            timestamp=unix_now()
        )


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
