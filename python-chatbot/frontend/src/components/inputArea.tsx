"use client"

import { useCallback, useState } from "react"
import {Input} from "./ui/input"
import {Button} from "./ui/button"
import {apiPath} from "../lib/utils"

export default function InputArea(props: {setState: any}) {
    const [message, setMessage] = useState("")

    const onSend = useCallback((message: string) => {

        const timestamp = Date.now();
        const eventsPath = apiPath(`/api/query?message=${message}&timestamp=${timestamp}`)
        const eventSource = new EventSource(eventsPath, {
            withCredentials: true
        })
        
        eventSource.onopen = (event) => {
            console.log("EventSource connection opened:", event);
        };
        
        eventSource.onerror = (error) => {
            console.error("EventSource error:", error);
            if (eventSource.readyState === EventSource.CLOSED) {
                console.error("Connection was closed");
            } else if (eventSource.readyState === EventSource.CONNECTING) {
                console.error("Connection is reconnecting");
            }
            eventSource.close();
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                props.setState(data);
            } catch (e) {
                console.error("Error parsing event data:", e);
            }
        }
    }, [props.setState])

    return (
        <div className="flex flex-row p-2 gap-2">
            <Input
             type="text"
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onSend(message);
                    setMessage("");
                }
                }}

             />
            <Button onClick={() => onSend(message)}>Send</Button>
        </div>
    )
}