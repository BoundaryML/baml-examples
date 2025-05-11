import asyncio
from baml_client.types import WeatherReport
from .utils import unix_now

# TODO: Implement these tools.

async def get_weather(location: str) -> WeatherReport:
    asyncio.sleep(1.0)
    WeatherReport(temperature=70, precipitation=0, timestamp=unix_now())

async def compute_value(expression: str) -> float:
    asyncio.sleep(1.0)
    return 42.0