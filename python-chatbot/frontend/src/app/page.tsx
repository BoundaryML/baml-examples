"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiPath from "../utils";
import { Role, State } from "../baml_client/types";
import { ChatMessage, ChatMessages } from "../components/chatMessages";

export default function Home() {
  const [state, setState] = useState<State>({ recent_messages: [] });
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Initialize session first
        await fetch(apiPath(""), { credentials: 'include' });
        
        // Then fetch state
        const res = await fetch(apiPath("/api/state"), { credentials: 'include' });
        const txt = await res.json();
        setState(txt);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    initializeSession();

    const eventSource = new EventSource(apiPath("/api/events"), { withCredentials: true });
    eventSource.onmessage = (event) => {
      console.log("Received event:", event);
    }
  }, []);

  return (
    <div className="bg-red-100 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ChatMessages items={[
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { text: "GetWeather", icon: "🔍"},
        { role: Role.Assistant, content: "Sunny and dry", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
      ]}/>
      {/* <pre> */}
        {/* {JSON.stringify(state)} */}
      {/* </pre> */}
    </div>
  );
}
