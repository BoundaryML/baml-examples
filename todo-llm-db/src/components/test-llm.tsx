'use client'

import { useState } from "react"
import { useSelectTools } from "../../baml_client/react/hooks"
import { State, Query } from "../../baml_client/types"
import { Input } from "@/components/ui/input"


function TestLLM() {
    const [queryText, setQueryText] = useState("")
    const hook = useSelectTools({stream: true})
    const state: State = {
        tool_history: [],
        todo_list: {
            items: []
        }
    }
    const query: Query = {
        message: queryText,
        date_time: Math.floor(Date.now() / 1000.0)
    }

    return (
        <div>
            <input
               type="text"
               className="border-2 border-gray-300 rounded-md p-2"
               value={queryText}
               onChange={(e) => setQueryText(e.target.value)} />
            <button onClick={() => hook.mutate(state, query)}>Create Todo</button>
            <div>
                <pre>
                    {JSON.stringify(hook.streamData, null, 2)}
                </pre>
            </div>
        </div>
    )
}

export { TestLLM }