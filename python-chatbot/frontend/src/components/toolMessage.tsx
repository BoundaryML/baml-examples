"use client"

import { Cloud, Calculator, Loader, CheckCircle, XCircle, Wrench } from "lucide-react";
import { Message } from "../baml_client/types";
import { useEffect, useState } from "react";

interface ToolData {
    tool: string;
    params: any;
    status: "calling" | "complete" | "error";
    result?: any;
    error?: string;
}

export function EnhancedToolMessage(props: { message: Message, isLastMessage: boolean }) {
    const [toolData, setToolData] = useState<ToolData | null>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(props.message.content || "");
            setToolData(parsed);
        } catch {
            setToolData(null);
        }
    }, [props.message.content]);

    if (!toolData) {
        return (
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-purple-600">
                            <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-sm text-gray-600">
                            {props.message.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getToolIcon = () => {
        switch (toolData.tool) {
            case "get_weather":
                return <Cloud className="w-4 h-4" />;
            case "compute_value":
                return <Calculator className="w-4 h-4" />;
            default:
                return <Wrench className="w-4 h-4" />;
        }
    };

    const getStatusIcon = () => {
        switch (toolData.status) {
            case "calling":
                return <Loader className="w-3 h-3 animate-spin" />;
            case "complete":
                return <CheckCircle className="w-3 h-3 text-green-600" />;
            case "error":
                return <XCircle className="w-3 h-3 text-red-600" />;
        }
    };

    const getToolName = () => {
        switch (toolData.tool) {
            case "get_weather":
                return "get_weather";
            case "compute_value":
                return "compute_value";
            default:
                return toolData.tool;
        }
    };

    const getToolDisplay = () => {
        if (toolData.tool === "get_weather") {
            if (toolData.status === "calling") {
                return `Getting weather for ${toolData.params.location}`;
            } else if (toolData.status === "complete" && toolData.result) {
                return `Weather in ${toolData.result.location}: ${toolData.result.temperature}°C, ${toolData.result.weather_status}`;
            }
        } else if (toolData.tool === "compute_value") {
            if (toolData.status === "calling") {
                return `Calculating ${toolData.params.expression}`;
            } else if (toolData.status === "complete" && toolData.result) {
                return `${toolData.result.expression} = ${toolData.result.value}`;
            }
        }

        if (toolData.status === "error") {
            return toolData.error || "Tool execution failed";
        }

        return `Using ${toolData.tool}`;
    };

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-purple-600">
                        <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-mono">
                                {getToolIcon()}
                                <span>{getToolName()}</span>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
                                toolData.status === "calling" ? "bg-gray-100 text-gray-700" :
                                toolData.status === "complete" ? "bg-green-50 text-green-700 border border-green-200" :
                                "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                                <span>{getToolDisplay()}</span>
                                {getStatusIcon()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}