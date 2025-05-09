"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { State } from "@/baml_client/types";

export default function Home() {
  const [state, setState] = useState<State>({ recent_messages: [] });
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Initialize session first
        await fetch("http://localhost:8000/", { credentials: 'include' });
        
        // Then fetch state
        const res = await fetch("/api/state");
        const txt = await res.json();
        setState(txt);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    initializeSession();

    const sseUrl = process.env.NEXT_PUBLIC_SSE_URL || '/api/events';
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSource.onmessage = (event) => {
      console.log("Received event:", event);
    }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {JSON.stringify(state)}
    </div>
  );
}
