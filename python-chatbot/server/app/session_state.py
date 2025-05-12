from datetime import datetime
from pydantic import BaseModel
from typing import Tuple, List
# from baml_client.types import GetWeatherReport, ComputeValue, MessageToUser, Restart, WeatherReport, Message, Role
from baml_client.types import State, Message, WeatherReport, Role
# from baml_client.types import GetWeatherReport, ComputeValue, Restart
from baml_client.partial_types import MessageToUser
from app.ui import UIUpdate, SetLocation, SetWeatherReport, SetRecentMessages, NewMessageToUser, UpdateLastMessageToUser
# This state closely matches the state that will be sent to the BAML agent
# function.

def sample_state() -> State:
    return State(
        # weather_report=WeatherReport(
        #     temperature=60,
        #     precipitation=0,
        #     timestamp=int(datetime.now().timestamp())
        # ),
        weather_report=None,
        recent_messages=[],
        message_history="""
        """
        
    )

# def handle_tool_call(tool_call: GetWeatherReport | ComputeValue | MessageToUser | Restart, state: SessionState) -> Tuple[SessionState, List[UIUpdate]]:
#     if tool_call.type == "get_weather_report":
#         return handle_get_weather_report(tool_call, state)
#     elif tool_call.type == "compute_value":
#         return handle_compute_value(tool_call, state)
#     elif tool_call.type == "message_to_user":
#         return handle_message_to_user(tool_call, state)
#     elif tool_call.type == "restart":
#         handle_restart(tool_call, state)
# 
# def handle_get_weather_report(tool_call: GetWeatherReport, state: SessionState) -> Tuple[SessionState, List[UIUpdate]]:
#     pass
# 
# def handle_compute_value(tool_call: ComputeValue, state: SessionState) -> Tuple[SessionState, List[UIUpdate]]:
#     pass
# 
# def handle_message_to_user(tool_call: MessageToUser, state: SessionState) -> Tuple[SessionState, List[UIUpdate]]:
#     pass
# 
# def handle_restart(tool_call: Restart, state: SessionState) -> Tuple[SessionState, List[UIUpdate]]:
#     pass