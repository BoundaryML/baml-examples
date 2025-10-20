"use client"

import { State } from "../baml_client/types"
import { ScrollArea } from "./ui/scroll-area"
import { ChevronLeft, ChevronRight, Code2, Activity } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"

export default function DebugPanel(props: { state: State }) {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return (
            <div className="border-l border-gray-200 bg-gray-50 w-12 flex flex-col items-center py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(true)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="mt-4 writing-vertical-rl text-xs text-gray-500 rotate-180">
                    Debug Panel
                </div>
            </div>
        );
    }

    return (
        <div className="border-l border-gray-200 bg-gray-50 w-96 flex flex-col">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-gray-600" />
                    <h2 className="text-sm font-semibold text-gray-700">Debug Panel</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {/* Session Info */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Session State
                        </h3>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>
                                    <span className="font-medium">Messages:</span> {props.state.recent_messages?.length || 0}
                                </div>
                                {props.state.weather_report && (
                                    <div>
                                        <span className="font-medium">Last Weather:</span> {props.state.weather_report.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Raw State */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-600 mb-2">Raw State Object</h3>
                        <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs text-green-400 font-mono">
{JSON.stringify(props.state, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Messages Timeline */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-600 mb-2">Message Flow</h3>
                        <div className="space-y-2">
                            {props.state.recent_messages?.map((msg, idx) => (
                                <div key={idx} className="bg-white rounded border border-gray-200 p-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                            msg.role === 'User' ? 'bg-blue-100 text-blue-700' :
                                            msg.role === 'Assistant' ? 'bg-green-100 text-green-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {msg.role}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="border-t border-gray-200 p-3">
                <p className="text-xs text-gray-500 text-center">
                    BAML Demo - Inspect state changes in real-time
                </p>
            </div>
        </div>
    );
}