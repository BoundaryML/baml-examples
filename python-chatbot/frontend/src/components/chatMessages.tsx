import { Wrench } from "lucide-react";
import { Message, Role } from "../baml_client/types";

interface ToolInfo {
    text: string;
    icon: string;
}

export function ChatMessages(props: { items: Message[] }) {
    return (
        <div className="flex flex-col flex-grow gap-5 border-1 border-slate-100 p-4 bg-slate-200 overflow-y-scroll">
            {props.items.map((item, index) => (
                <div key={index} className="flex flex-row w-full">
                    {'role' in item ? (
                        item.role === Role.Tool
                        ?  <ToolMessage message={item} isLastMessage={index === props.items.length - 1}/>
                        : <ChatMessage message={item} isLastMessage={index === props.items.length - 1}/>
                    ) : (
                        <p></p>
                    )}
                </div>
            ))}
        </div>
    )
}

export function ChatMessage(props: { message: Message, isLastMessage: boolean }) {
    const bgColor = props.message.role === Role.Assistant ? "bg-blue-200" : "bg-slate-300";
    const flexJustify = props.message.role === Role.Assistant ? "justify-start" : "justify-end";
    return (
        <div className={`flex w-full ${flexJustify}`}>
            <div className={`${bgColor} rounded-md p-2 max-w-[80%]`}>
                <p>{props.message.content}</p>
            </div>
        </div>
    )
}

export function ToolMessage(props: { message: Message, isLastMessage: boolean }) {
    const wrenchIcon = props.message.role === Role.Tool ? (
      <span className={`${props.isLastMessage ? "animate-pulse" : ""}`}><Wrench /></span>
    ) : null;
    const dim = props.isLastMessage ? "" : "opacity-25";
    return (
        <div className={`flex flex-row w-full justify-center p-2 border-t border-b border-slate-400 gap-2 ${dim}`}>
            <span>{props.message.content}</span>
            <span className={`${props.isLastMessage ? "animate-pulse" : ""}`}><Wrench /></span>
        </div>
    )
}