from typing import Set, Dict, cast
from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
import os
import uuid
import asyncio
import json
import logging
from collections import defaultdict

from datetime import datetime, timedelta

from baml_client.partial_types import StreamState
from .session_store import session_store, initial_state
from . import tool_handlers
from baml_client import b
from baml_client.types import Message, MessageToUser, Query, Role, State
from .utils import unix_now
# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Python Chatbot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_session_state(request: Request) -> State:
    """Dependency to get the current session's state."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    return session_store.get_state(session_id)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root(request: Request, response: Response):
    logger.info("Root endpoint hit")
    # Check if session cookie already exists
    existing_session = request.cookies.get("session_id")
    logger.info(f"Existing session cookie: {existing_session}")
    
    if existing_session:
        # Ensure the session has a state
        return FileResponse(os.path.join(static_dir, "index.html"))
    
    # Generate a random session ID
    session_id = str(uuid.uuid4())
    logger.info(f"Generated new session ID: {session_id}")
    
    # Initialize the session state
    session_store.get_state(session_id)
    
    # Set the session ID cookie
    # Cookie will expire in 30 days
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Allow cookies over HTTP in development
        samesite="lax",  # Protect against CSRF
        max_age=30 * 24 * 60 * 60,  # 30 days in seconds
        path="/"  # Available across all paths
    )
    logger.info("Cookie set in response")
    
    return FileResponse(os.path.join(static_dir, "index.html"))


# Example of how to use the session state in other routes
@app.get("/api/state")
def get_state(state: State = Depends(get_session_state)):
    """Example endpoint that uses the session state."""
    return state.model_dump_json()

@app.get("/api/query")
async def query(request: Request, message: str, timestamp: int, state: State = Depends(get_session_state)):
    """Endpoint that triggers LLM call and returns a request ID for SSE connection."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    
    query = Query(message=message, timestamp=timestamp)
    state.recent_messages.append(Message(role=Role.User, content=message, timestamp=timestamp))
    
    async def event_generator():

        # Yield the initial state early, to get the user's message to the client.
        yield f"data: {state.model_dump_json()}\n\n"
        command_index = 0
        running = True
        processed_commands = set()
        commands_with_messages = set()
        res = b.stream.ChooseTools(state, query)

        while running:
            running = False

            async for chunk in res:
                logger.info(f"Chunk received: {chunk}")
                try:
                    if chunk is None or len(chunk) == 0:
                        logger.info("Chunk is None or empty")
                        continue
                    command_index = len(chunk) - 1
                    logger.info(f"Command index: {command_index}")
                    if command_index in processed_commands:
                        logger.info(f"Command {command_index} already processed")
                        continue
                    
                    current_command = chunk[command_index]
                    logger.info(f"Current command: {current_command}")
                    
                    if current_command.type == "get_weather_report":
                        state.recent_messages.append(Message(role=Role.Tool, content="Getting Weather...", timestamp=unix_now()))
                        logger.info("About to tool_handlers.get_weather")
                        weather_report = await tool_handlers.get_weather(current_command.location)
                        logger.info(f"Weather report: {weather_report}")
                        state.weather_report = weather_report
                        processed_commands.add(command_index)
                        
                    if current_command.type == "compute_value":
                        state.recent_messages.append(Message(role=Role.Tool, content="Compute Value", timestamp=unix_now()))
                        value = await tool_handlers.compute_value(current_command.arithmetic_expression)
                        logger.info(f"Value: {value}")
                        state.recent_messages.append(Message(role=Role.Assistant, content=f"{current_command.arithmetic_expression} = {value}", timestamp=unix_now()))
                        processed_commands.add(command_index)
                        
                    if current_command.type == "message_to_user":
                        message_to_user = cast(MessageToUser, current_command)
                        content = "" if message_to_user.message.value is None else message_to_user.message.value
                        # content_done = message_to_user.message.stream_state == StreamState.Done
                        if command_index not in commands_with_messages:
                            state.recent_messages.append(Message(role=Role.Assistant, content=content, timestamp=unix_now()))
                            commands_with_messages.add(command_index)
                        else:
                            if state.recent_messages:  # Check if list is not empty
                                state.recent_messages[-1].content = content
                            else:
                                state.recent_messages.append(Message(role=Role.Assistant, content=content, timestamp=unix_now()))
                        logger.info(f"Message to user: {message_to_user.message.state}")
                        if message_to_user.message.state == "Complete":
                            processed_commands.add(command_index)
                        
                    if current_command.type == "resume":
                        logger.info("Resuming")
                        res = b.stream.ChooseTools(state, query)
                        processed_commands = set()
                        commands_with_messages = set()
                        running = True
                        continue

                    logger.info("Sending the state")
                    yield f"data: {state.model_dump_json()}\n\n"
                except Exception as e:
                    logger.error(f"Error in event generator: {str(e)}")
                    raise
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# Mount static files for production
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    logger.error(f"Static assets directory not found")