from typing import Set, Dict, cast
from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import uuid
import asyncio
import json
import logging
from collections import defaultdict
from dotenv import load_dotenv

from datetime import datetime, timedelta

# Load environment variables from .env file if it exists
load_dotenv()


from baml_client.stream_types import StreamState
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
    # Try to get session from cookie first
    session_id = request.cookies.get("session_id")

    # In dev mode, also check for session in query params (for cross-origin)
    if not session_id:
        session_id = request.query_params.get("session_id")

    # If still no session, check headers (for dev mode)
    if not session_id:
        session_id = request.headers.get("X-Session-Id")

    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    return session_store.get_state(session_id)

@app.post("/api/session")
def create_session():
    """Create a new session and return the session ID."""
    session_id = str(uuid.uuid4())
    state = session_store.get_state(session_id)
    logger.info(f"Created new session: {session_id}")
    return {"session_id": session_id}

@app.get("/api/sessions")
def get_all_sessions():
    """Get all sessions with their first message for display."""
    sessions_info = []
    for sid, state in session_store._sessions.items():
        # Get first user message as title
        title = "New chat"
        for msg in state.recent_messages:
            if msg.role == Role.User:
                title = msg.content[:50] + "..." if len(msg.content) > 50 else msg.content
                break

        sessions_info.append({
            "id": sid,
            "title": title,
            "message_count": len(state.recent_messages),
            "timestamp": state.recent_messages[0].timestamp if state.recent_messages else unix_now()
        })

    # Sort by timestamp, newest first
    sessions_info.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"sessions": sessions_info}

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    """Delete a specific session."""
    if session_id in session_store._sessions:
        del session_store._sessions[session_id]
        return {"success": True}
    return {"success": False, "error": "Session not found"}

@app.get("/api/health")
def health_check():
    # Check if at least one API key is configured
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY"))

    if not has_openai and not has_anthropic:
        return {
            "status": "missing_api_keys",
            "message": "No API keys configured. Please set either OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable."
        }

    return {"status": "ok", "api_keys_configured": {
        "openai": has_openai,
        "anthropic": has_anthropic
    }}

@app.get("/")
def root():
    return {"message": "BAML Chatbot API", "status": "running"}


# Example of how to use the session state in other routes
@app.get("/api/state")
def get_state(state: State = Depends(get_session_state)):
    """Example endpoint that uses the session state."""
    logger.info(f"Getting state with {len(state.recent_messages)} messages")
    return state.model_dump()

@app.get("/api/query")
async def query(request: Request, message: str, timestamp: int, state: State = Depends(get_session_state)):
    """Endpoint that triggers LLM call and returns a request ID for SSE connection."""
    # Session is already validated by get_session_state dependency
    session_id = (request.cookies.get("session_id") or
                  request.query_params.get("session_id") or
                  request.headers.get("X-Session-Id"))
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")

    # Check for API keys before attempting to use the LLM
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        error_message = "No API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable."
        state.recent_messages.append(Message(role=Role.Assistant, content=f"❌ Error: {error_message}", timestamp=unix_now()))

        async def error_generator():
            yield f"data: {state.model_dump_json()}\n\n"

        return StreamingResponse(
            error_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    query = Query(message=message, timestamp=timestamp)
    state.recent_messages.append(Message(role=Role.User, content=message, timestamp=timestamp))

    async def event_generator():
        try:
            # Yield the initial state early, to get the user's message to the client.
            yield f"data: {state.model_dump_json()}\n\n"
            command_index = 0
            running = True
            processed_commands = set()
            commands_with_messages = set()

            try:
                res = b.stream.ChooseTools(state, query)
            except Exception as e:
                logger.error(f"Error calling BAML ChooseTools: {str(e)}")
                # Parse and format error message
                error_msg = str(e)
                if "Incorrect API key" in error_msg:
                    error_msg = "❌ Invalid API key. Please check your OPENAI_API_KEY configuration."
                elif "401" in error_msg or "Unauthorized" in error_msg:
                    error_msg = "❌ Authentication failed. Please verify your API key is correct and active."
                elif "rate limit" in error_msg.lower():
                    error_msg = "❌ Rate limit exceeded. Please wait a moment and try again."
                elif "quota" in error_msg.lower():
                    error_msg = "❌ API quota exceeded. Please check your API account."
                else:
                    # Truncate very long error messages
                    if len(error_msg) > 300:
                        error_msg = f"❌ Error: {error_msg[:300]}..."
                    else:
                        error_msg = f"❌ Error: {error_msg}"

                state.recent_messages.append(Message(
                    role=Role.Assistant,
                    content=error_msg,
                    timestamp=unix_now()
                ))
                yield f"data: {state.model_dump_json()}\n\n"
                return

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
                            # Send tool invocation with "calling" status
                            tool_call = {
                                "tool": "get_weather",
                                "params": {"location": current_command.location},
                                "status": "calling"
                            }
                            state.recent_messages.append(Message(
                                role=Role.Tool,
                                content=json.dumps(tool_call),
                                timestamp=unix_now()
                            ))
                            yield f"data: {state.model_dump_json()}\n\n"

                            logger.info("About to tool_handlers.get_weather")
                            weather_report = await tool_handlers.get_weather(current_command.location)
                            logger.info(f"Weather report: {weather_report}")

                            # Update the last message with the result
                            if weather_report:
                                tool_result = {
                                    "tool": "get_weather",
                                    "params": {"location": current_command.location},
                                    "status": "complete",
                                    "result": {
                                        "location": weather_report.location,
                                        "temperature": weather_report.temperature,
                                        "weather_status": weather_report.weather_status
                                    }
                                }
                                state.weather_report = weather_report
                            else:
                                tool_result = {
                                    "tool": "get_weather",
                                    "params": {"location": current_command.location},
                                    "status": "error",
                                    "error": "Could not get weather data"
                                }

                            # Update the last message instead of adding a new one
                            if state.recent_messages:
                                state.recent_messages[-1].content = json.dumps(tool_result)
                            processed_commands.add(command_index)

                        if current_command.type == "compute_value":
                            # Send tool invocation with "calling" status
                            tool_call = {
                                "tool": "compute_value",
                                "params": {"expression": current_command.arithmetic_expression},
                                "status": "calling"
                            }
                            state.recent_messages.append(Message(
                                role=Role.Tool,
                                content=json.dumps(tool_call),
                                timestamp=unix_now()
                            ))
                            yield f"data: {state.model_dump_json()}\n\n"

                            try:
                                value = await tool_handlers.compute_value(current_command.arithmetic_expression)
                                logger.info(f"Value: {value}")

                                # Update with result
                                tool_result = {
                                    "tool": "compute_value",
                                    "params": {"expression": current_command.arithmetic_expression},
                                    "status": "complete",
                                    "result": {"value": value, "expression": current_command.arithmetic_expression}
                                }
                            except Exception as e:
                                # Handle calculation errors
                                tool_result = {
                                    "tool": "compute_value",
                                    "params": {"expression": current_command.arithmetic_expression},
                                    "status": "error",
                                    "error": str(e)
                                }

                            # Update the last message instead of adding a new one
                            if state.recent_messages:
                                state.recent_messages[-1].content = json.dumps(tool_result)
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
                        logger.error(f"Error in chunk processing: {str(e)}")
                        # Send error to frontend
                        state.recent_messages.append(Message(
                            role=Role.Assistant,
                            content=f"❌ Error processing response: {str(e)[:200]}",
                            timestamp=unix_now()
                        ))
                        yield f"data: {state.model_dump_json()}\n\n"
        except Exception as e:
            logger.error(f"Unexpected error in event generator: {str(e)}")
            # Send generic error to frontend
            state.recent_messages.append(Message(
                role=Role.Assistant,
                content=f"❌ An unexpected error occurred. Please try again later.",
                timestamp=unix_now()
            ))
            yield f"data: {state.model_dump_json()}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# API-only server, no static files
