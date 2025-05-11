"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiPath from "../utils";
import { Role, State } from "../baml_client/types";
import { ChatMessage, ChatMessages } from "../components/chatMessages";
import StateDrawer from "../components/stateDrawer";
import InputArea from "../components/inputArea";

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

    // const eventSource = new EventSource(apiPath("/api/events"), { withCredentials: true });
    // eventSource.onmessage = (event) => {
    //   console.log("Received event:", event);
    // }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row justify-center">
        <h1 className="text-2xl font-bold text-center p-2 flex-size-1">BAML Chatbot</h1>
        <StateDrawer state={state} />
      </div>
      <ChatMessages items={[
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { text: "GetWeather", icon: "🔍"},
        { role: Role.Assistant, content: "Sunny and dry", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather?", timestamp: Date.now()},
        { role: Role.User, content: "Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? ", timestamp: Date.now()},
        { role: Role.Assistant, content: "Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? Hi! What's the weather? ", timestamp: Date.now()},
      ]}/>
      <InputArea setState={setState}></InputArea>
      {/* <pre> */}
        {/* {JSON.stringify(state)} */}
      {/* </pre> */}
    </div>
  );
}
