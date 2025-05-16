# This file contains the UI updates that can be sent to the client.
# TODO: Delete.

from pydantic import BaseModel
from baml_client.types import WeatherReport, Message

class UIUpdate(BaseModel):
    pass

class SetLocation(UIUpdate):
    location: str

class SetWeatherReport(UIUpdate):
    weather_report: WeatherReport

class SetRecentMessages(UIUpdate):
    recent_messages: list[Message]

class NewMessageToUser(UIUpdate):
    message: Message

class UpdateLastMessageToUser(UIUpdate):
    message: Message

class InformUsingTool(UIUpdate):
    tool_name: str

class InformReadyForMoreInput(UIUpdate):
    pass
