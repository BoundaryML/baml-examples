import { Message, Role } from "../baml_client/types";
import { EnhancedToolMessage } from "./toolMessage";
import { User, Bot } from "lucide-react";

export function ChatMessages(props: {
    items: Message[],
    onSuggestedPrompt?: (prompt: string, autoSend: boolean) => void
}) {
    return (
        <div className="flex-1 overflow-y-auto">
            {props.items.length === 0 && (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">BAML Chatbot</h1>
                        <p className="text-gray-600 mb-8">How can I help you today?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            <div
                                className="border rounded-lg p-4 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => props.onSuggestedPrompt?.("What's the weather in Tokyo?", true)}
                            >
                                <p className="text-sm font-medium text-gray-700">Simple Weather</p>
                                <p className="text-xs text-gray-500 mt-1">Try: "What's the weather in Tokyo?"</p>
                            </div>
                            <div
                                className="border rounded-lg p-4 text-left hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => props.onSuggestedPrompt?.("Average weather in SF, NYC, and Seattle? But in Fahrenheit.", true)}
                            >
                                <p className="text-sm font-medium text-gray-700">Multi-City Weather</p>
                                <p className="text-xs text-gray-500 mt-1">Try: "Average weather in SF, NYC, and Seattle? But in F."</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {props.items.map((item, index) => (
                <div key={index}>
                    {'role' in item ? (
                        item.role === Role.Tool
                        ?  <EnhancedToolMessage message={item} isLastMessage={index === props.items.length - 1}/>
                        : <ChatMessage message={item} isLastMessage={index === props.items.length - 1}/>
                    ) : null}
                </div>
            ))}
        </div>
    )
}

export function ChatMessage(props: { message: Message, isLastMessage: boolean }) {
    const isUser = props.message.role === Role.User;

    return (
        <div className={`group ${isUser ? "bg-white" : "bg-gray-50"} border-b border-gray-200`}>
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center ${
                        isUser ? "bg-gray-600" : "bg-green-600"
                    }`}>
                        {isUser ? (
                            <User className="h-5 w-5 text-white" />
                        ) : (
                            <Bot className="h-5 w-5 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{props.message.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}