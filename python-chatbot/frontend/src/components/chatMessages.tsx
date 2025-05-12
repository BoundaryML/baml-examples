import { Message, Role } from "../baml_client/types";

interface ToolInfo {
    text: string;
    icon: string;
}

export function ChatMessages(props: { items: Message[] }) {
    return (
        // TODO: make scroll follow to bottom.
        <div className="flex flex-col flex-grow gap-5 border-1 border-slate-100 p-4 bg-slate-200 overflow-y-scroll">
            {props.items.map((item, index) => (
                <div key={index} className="flex flex-row w-full">
                    <ChatMessage message={item}/>
                </div>
            ))}
        </div>
    )
}

export function ChatMessage(props: { message: Message }) {
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