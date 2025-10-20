'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquarePlus, MessageSquare, Trash2 } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  message_count: number;
  timestamp: number;
}

interface SidebarProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Sidebar({ currentSessionId, onSessionSelect, onNewChat, onDeleteSession }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions.sort((a: Session, b: Session) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Refresh sessions every 5 seconds
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [currentSessionId]);

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDeleteSession(sessionId);
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 w-64">
      <div className="p-3 border-b border-gray-800">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-100"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                session.id === currentSessionId
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-800/50 text-gray-300'
              }`}
              onClick={() => onSessionSelect(session.id)}
              onMouseEnter={() => setHoveredSession(session.id)}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{session.title}</span>
              {(hoveredSession === session.id || session.id === currentSessionId) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}