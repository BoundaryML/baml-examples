"use client";

import { useEffect, useState, useRef } from "react";
import {apiPath} from "../lib/utils";
import { Role, State } from "../baml_client/types";
import { ChatMessage, ChatMessages } from "../components/chatMessages";
import InputArea from "../components/inputArea";
import Sidebar from "../components/sidebar";
import DebugPanel from "../components/debugPanel";
import { Menu } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Home() {

  const [state, setState] = useState<State>({ recent_messages: [] });
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [suggestedPrompt, setSuggestedPrompt] = useState<{text: string, autoSend: boolean}>({text: "", autoSend: false});

  const initializeSession = async (specificSessionId?: string) => {
    try {
      // Check API health first
      const healthRes = await fetch(apiPath("/api/health"));
      const healthData = await healthRes.json();

      if (healthData.status === "missing_api_keys") {
        setApiKeyError(healthData.message);
      } else {
        setApiKeyError(null);
      }

      let targetSessionId = specificSessionId;

      if (!targetSessionId) {
        // Get or create session ID
        let storedSessionId = localStorage.getItem('session_id');

        if (!storedSessionId) {
          // Create a new session
          const sessionRes = await fetch(apiPath("/api/session"), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const sessionData = await sessionRes.json();
          storedSessionId = sessionData.session_id;
          localStorage.setItem('session_id', storedSessionId);
        }
        targetSessionId = storedSessionId;
      } else {
        // Update localStorage with the selected session
        localStorage.setItem('session_id', targetSessionId);
      }

      setSessionId(targetSessionId);

      // Fetch state with session ID
      const res = await fetch(apiPath("/api/state"), {
        credentials: 'include',
        headers: { 'X-Session-Id': targetSessionId }
      });

      if (res.ok) {
        const txt = await res.json();
        console.log('Fetched state for session', targetSessionId, ':', txt);
        setState(txt);
      } else {
        console.error('Failed to fetch state:', res.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const handleNewChat = async () => {
    try {
      // Create a new session
      const sessionRes = await fetch(apiPath("/api/session"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const sessionData = await sessionRes.json();
      const newSessionId = sessionData.session_id;

      localStorage.setItem('session_id', newSessionId);
      setSessionId(newSessionId);
      setState({ recent_messages: [] });

      // Fetch the new empty state
      await initializeSession(newSessionId);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    // Clear current state first to show loading state
    setState({ recent_messages: [] });
    await initializeSession(selectedSessionId);
  };

  const handleDeleteSession = (deletedSessionId: string) => {
    if (deletedSessionId === sessionId) {
      // If we deleted the current session, create a new one
      handleNewChat();
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          currentSessionId={sessionId || ''}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {apiKeyError && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <p className="text-sm text-yellow-800">
              ⚠️ {apiKeyError}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-800">BAML Chatbot</h1>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ChatMessages
          items={state.recent_messages || []}
          onSuggestedPrompt={async (prompt, autoSend) => {
            // If it's a new chat, create a new session first
            if (state.recent_messages.length === 0 && autoSend) {
              await handleNewChat();
            }
            setSuggestedPrompt({text: prompt, autoSend});
          }}
        />

        {/* Input Area */}
        <InputArea
          setState={setState}
          sessionId={sessionId}
          suggestedPrompt={suggestedPrompt.text}
          autoSend={suggestedPrompt.autoSend}
          onPromptUsed={() => setSuggestedPrompt({text: "", autoSend: false})}
        />
      </div>

      {/* Debug Panel */}
      <DebugPanel state={state} />
    </div>
  );
}