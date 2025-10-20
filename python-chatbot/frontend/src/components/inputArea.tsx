"use client"

import { useCallback, useState, useEffect } from "react"
import { Button } from "./ui/button"
import { apiPath } from "../lib/utils"
import { Send, Paperclip } from "lucide-react"

export default function InputArea(props: {
    setState: any,
    sessionId: string | null,
    suggestedPrompt?: string,
    autoSend?: boolean,
    onPromptUsed?: () => void
}) {
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const onSend = useCallback((message: string) => {
        if (!props.sessionId || isLoading) {
            console.error("No session ID available or already loading");
            return;
        }

        setIsLoading(true);
        const timestamp = Date.now();
        const eventsPath = apiPath(`/api/query?message=${message}&timestamp=${timestamp}&session_id=${props.sessionId}`)
        const eventSource = new EventSource(eventsPath, {
            withCredentials: true
        })

        eventSource.onopen = (event) => {
            console.log("EventSource connection opened:", event);
        };

        eventSource.onerror = (error) => {
            console.error("EventSource error:", error);
            setIsLoading(false);
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

                // Check if we're done (last message is from assistant and not a tool)
                if (data.recent_messages && data.recent_messages.length > 0) {
                    const lastMessage = data.recent_messages[data.recent_messages.length - 1];
                    if (lastMessage.role === "assistant") {
                        setIsLoading(false);
                        eventSource.close();
                    }
                }
            } catch (e) {
                console.error("Error parsing event data:", e);
                setIsLoading(false);
            }
        }
    }, [props.setState, props.sessionId, isLoading])

    // Update message when a suggested prompt is received
    useEffect(() => {
        if (props.suggestedPrompt) {
            setMessage(props.suggestedPrompt);
            props.onPromptUsed?.();

            // If autoSend is true, automatically send the message
            if (props.autoSend && props.suggestedPrompt && !isLoading) {
                // Small delay to ensure session is ready
                setTimeout(() => {
                    onSend(props.suggestedPrompt);
                    setMessage("");
                }, 100);
            } else {
                // Just focus the textarea if not auto-sending
                const textarea = document.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                }
            }
        }
    }, [props.suggestedPrompt, props.autoSend, onSend, isLoading, props.onPromptUsed]);

    return (
        <div className="border-t bg-white">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (message.trim() && !isLoading) {
                                    onSend(message);
                                    setMessage("");
                                }
                            }
                        }}
                        placeholder="Message BAML Chatbot..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-gray-400 focus:outline-none"
                        rows={1}
                        style={{
                            minHeight: '52px',
                            maxHeight: '200px',
                            height: 'auto'
                        }}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => {
                            if (message.trim() && !isLoading) {
                                onSend(message);
                                setMessage("");
                            }
                        }}
                        disabled={!message.trim() || isLoading}
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-md p-0 bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-2 text-xs text-center text-gray-500">
                    BAML can assist with weather information and calculations
                </div>
            </div>
        </div>
    )
}