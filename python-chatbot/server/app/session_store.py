from typing import Dict
from .session_state import SessionState

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}
    
    def get_state(self, session_id: str) -> SessionState:
        """Get the state for a session, creating a new one if it doesn't exist."""
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState.sample_state()
        return self._sessions[session_id]
    
    def set_state(self, session_id: str, state: SessionState) -> None:
        """Update the state for a session."""
        self._sessions[session_id] = state
    
    def delete_session(self, session_id: str) -> None:
        """Remove a session and its state."""
        if session_id in self._sessions:
            del self._sessions[session_id]

# Create a global session store instance
session_store = SessionStore() 