"use client"

import { useCallback, useState } from "react"
import {Input} from "./ui/input"
import {Button} from "./ui/button"
import apiPath from "../utils"
import { Query } from "../baml_client/types"


export default function InputArea(props: {setState: any}) {
    const [message, setMessage] = useState("")

    const onSend = useCallback((message: string) => {

        const query: Query = {
            message: message,
            timestamp: Date.now()
        }
        fetch(apiPath("/api/query"), {
            method: "POST", 
            body: JSON.stringify(query),
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            const request_id = data.request_id;
            const eventSource = new EventSource(apiPath(`/api/events?request_id=${request_id}`), { withCredentials: true });
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            props.setState(data)
            console.log("Received event:", event);
        }
        })
    }, [props.setState])

    return (
        <div className="flex flex-row p-2 gap-2">
            <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button onClick={() => onSend(message)}>Send</Button>
        </div>
    )
}