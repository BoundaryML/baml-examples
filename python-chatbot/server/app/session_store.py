from typing import Dict
from datetime import datetime
from baml_client.types import State, Role


class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, State] = {}
    
    def get_state(self, session_id: str) -> State:
        """Get the state for a session, creating a new one if it doesn't exist."""
        if session_id not in self._sessions:
            self._sessions[session_id] = initial_state()
        return self._sessions[session_id]
    
    def set_state(self, session_id: str, state: State) -> None:
        """Update the state for a session."""
        self._sessions[session_id] = state
    
    def delete_session(self, session_id: str) -> None:
        """Remove a session and its state."""
        if session_id in self._sessions:
            del self._sessions[session_id]

# Create a global session store instance

session_store = SessionStore() 

def initial_state() -> State:
    return State(
        weather_report=None,
        recent_messages=[{
            "role": Role.Assistant,
            "content": "Hello! I'm a chatbot. How can I help you today?",
            "timestamp": int(datetime.now().timestamp())
        }],
    )
