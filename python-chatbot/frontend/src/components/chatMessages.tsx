import { Message } from "@/baml_client/types";

export function ChatMessage(props: { message: Message }) {
    return (
        <div>
            <p>{props.message.content}</p>
        </div>
    )
}