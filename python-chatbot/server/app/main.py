from fastapi import FastAPI, Response, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
import os
import uuid
import asyncio
import json
import logging
from datetime import datetime, timedelta
from .session_store import session_store
from .session_state import SessionState

# Set up logging
logging.basicConfig(level=logging.INFO)
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
        session_store.get_state(existing_session)
        return {"message": "Session already exists"}
    
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
    
    # Return a simple response
    return {"message": "Session initialized"}

# Example of how to use the session state in other routes
@app.get("/api/state")
def get_state(state: SessionState = Depends(get_session_state)):
    """Example endpoint that uses the session state."""
    return {
        "weather_report": state.weather_report,
        "recent_messages": state.recent_messages,
        "message_history": state.message_history
    }

@app.get("/api/events")
async def events(request: Request):
    """Endpoint that sends Server-Sent Events with session ID and sequence number."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="No session found")
    
    async def event_generator():
        sequence = 0
        while True:
            # Create the event data
            event_data = {
                "session_id": session_id,
                "sequence": sequence,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Format the SSE message
            yield f"data: {json.dumps(event_data)}\n\n"
            
            sequence += 1
            await asyncio.sleep(1)  # Wait for 1 second before sending next event
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable buffering for nginx
        }
    )

# Mount static files for production
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")