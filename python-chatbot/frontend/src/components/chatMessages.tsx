import { Message } from "../baml_client/types";

interface ToolInfo {
    text: string;
    icon: string;
}

export function ChatMessages(props: { items: (Message|ToolInfo)[] }) {
    return (
        <div className="flex flex-col gap-2 border-1 border-gray-300 rounded-md p-2 bg-slate-200">
            {props.items.map((item, index) => (
                <div key={index}>
                    {'role' in item ? (
                        <ChatMessage message={item}/>
                    ) : (
                        <p>{item.text}</p>
                    )}
                </div>
            ))}
        </div>
    )
}

export function ChatMessage(props: { message: Message }) {
    return (
        <div className="text-green-500">
            <p>{props.message.content}</p>
        </div>
    )
}