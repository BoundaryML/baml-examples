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
from .session_store import session_store
from . import tool_handlers
from .session_state import SessionState
from baml_client import b
from baml_client.types import Message, MessageToUser, Query, Role
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

# Global request queue to store events for each request
request_queues: Dict[str, asyncio.Queue] = defaultdict(asyncio.Queue)

async def get_session_state(request: Request) -> SessionState:
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
def get_state(state: SessionState = Depends(get_session_state)):
    """Example endpoint that uses the session state."""
    return {
        "weather_report": state.weather_report,
        "recent_messages": state.recent_messages,
        "message_history": state.message_history
    }

@app.post("/api/query")
async def query(request: Request, state: SessionState = Depends(get_session_state)):
    """Endpoint that triggers LLM call and returns a request ID for SSE connection."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    
    query: Query = await request.json()
    request_id = str(uuid.uuid4())
    
    # Create the queue explicitly before starting the task
    request_queues[request_id] = asyncio.Queue()
    logger.info(f"Created queue for request {request_id}")
    
    # Start processing in background
    asyncio.create_task(process_llm_request(request_id, state, query))
    
    return {"request_id": request_id}

async def process_llm_request(request_id: str, state: SessionState, query: Query):
    """Background task to process LLM request and queue events."""
    try:
        processed_commands = set()
        res = b.stream.ChooseTools(state, query)
        
        while True:
            logger.info(f"Processing LLM request {request_id}")
            async for chunk in res:
                logger.info(f"Chunk: {chunk}")
                if chunk is None or len(chunk) < 1:
                    continue
                command_index = len(chunk) - 1
                if command_index in processed_commands:
                    continue
                    
                current_command = chunk[command_index]
                
                if current_command.type == "get_weather":
                    state.recent_messages.append(Message(role=Role.Tool, content="Get Weather", timestamp=unix_now()))
                    weather_report = await tool_handlers.get_weather(current_command.location)
                    state.weather_report = weather_report
                    processed_commands.add(command_index)
                    await request_queues[request_id].put({"type": "state_update", "data": state})
                    
                if current_command.type == "compute_value":
                    state.recent_messages.append(Message(role=Role.Tool, content="Compute Value", timestamp=unix_now()))
                    value = await tool_handlers.compute_value(current_command.expression)
                    processed_commands.add(command_index)
                    await request_queues[request_id].put({"type": "state_update", "data": state})
                    
                if current_command.type == "message_to_user":
                    message_to_user = cast(MessageToUser, current_command)
                    content = "" if message_to_user.message.value is None else message_to_user.message.value
                    # content_done = message_to_user.message.stream_state == StreamState.Done
                    if command_index not in processed_commands:
                        state.recent_messages.append(Message(role=Role.Assistant, content=content, timestamp=unix_now()))
                        processed_commands.add(command_index)
                    else:
                        if state.recent_messages:  # Check if list is not empty
                            state.recent_messages[-1].content = content
                        else:
                            state.recent_messages.append(Message(role=Role.Assistant, content=content, timestamp=unix_now()))
                    await request_queues[request_id].put({"type": "state_update", "data": state})
                    
                if current_command.type == "resume":
                    res = b.stream.ChooseTools(state, query)
                    continue
                    
    except Exception as e:
        logger.error(f"Error processing LLM request: {e}")
        await request_queues[request_id].put({"type": "error", "data": str(e)})
    finally:
        # Signal completion
        await request_queues[request_id].put({"type": "complete"})

@app.get("/api/events")
async def events(request: Request, request_id: str):
    """Endpoint that streams events for a specific request."""
    logger.info(f"Events endpoint hit for request {request_id}")
    logger.info(f"Request queues: {request_queues.keys()}")
    if request_id not in request_queues:
        raise HTTPException(status_code=404, detail="Request not found in request_queues")
    
    logger.info(f"Request queues: {request_queues}")
    logger.info(f"Request queues: {request_queues[request_id]}")
    
    async def event_generator():
        queue = request_queues[request_id]
        try:
            while True:
                event = await queue.get()
                if event["type"] == "complete":
                    break
                yield f"data: {json.dumps(event)}\n\n"
        finally:
            # Clean up the queue when done
            del request_queues[request_id]
    
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
    logger.info(f"Serving static assets")
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    logger.info(f"Static assets directory not found")