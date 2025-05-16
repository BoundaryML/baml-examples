"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {apiPath} from "../lib/utils";
import { Role, State } from "../baml_client/types";
import { ChatMessage, ChatMessages } from "../components/chatMessages";
import StateDrawer from "../components/stateDrawer";
import InputArea from "../components/inputArea";

export default function Home() {
  const [state, setState] = useState<State>({ recent_messages: [] });
  useEffect(() => {
    const initializeSession = async () => {
      try {

        // Initialize session first.
        // This will create a session cookie.
        await fetch(apiPath(""), { credentials: 'include' });
        
        // Then fetch state.
        const res = await fetch(apiPath("/api/state"), { credentials: 'include' });
        const txt = await res.json();
        setState(txt);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    initializeSession();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row justify-center">
        <h1 className="text-2xl font-bold text-center p-2 flex-size-1">
          BAML Chatbot
        </h1>
        <StateDrawer state={state} />
      </div>
      <ChatMessages items={state.recent_messages || []} />
      <InputArea setState={setState}></InputArea>
    </div>
  );
}
