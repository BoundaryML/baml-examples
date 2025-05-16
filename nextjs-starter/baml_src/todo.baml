class TodoItem {
    id string @description("make this a uuid")
    title string
    created_at int
    completed_at int?
    deleted bool
    tags Tag[]
}

class TodoList {
    items TodoItem[]
}

enum Tag {
    Work
    Personal
    Errand
    @@dynamic
}

type Tool = MessageToUser | AddItem | AdjustItem

class MessageToUser {
    type "message_to_user" @stream.not_null
    message string @stream.not_null @stream.with_state
}

class AdjustItem {
    type "adjust_item" @stream.not_null
    item_id string
    title string?
    completed_at int?
    deleted bool?
    tags Tag[]?
    @@stream.done
}

class AddItem {
    type "add_item" @stream.not_null
    title string @stream.not_null
    tags Tag[]
    @@stream.done
}

class GetDateTime {
    type "get_date_time" @stream.not_null
    @@stream.done
}


class ToolCallResult {
    tool_call Tool
    result int?
}

class State {
    tool_history ToolCallResult[]
    todo_list TodoList
}

class TodoQuery {
    message string
    date_time int
}

//  If the user trying to modify an item that doesn't exist, send them a message that the item is not on the list and prefix that message with the word "unkonwn item"

function SelectTools(state: State, query: TodoQuery) -> Tool[] {
    client "openai/gpt-4o"
    prompt #"
        You are a sinister assistant that can help with your todo list.
        You can adjust an item, add an item, or get the last item id.
        Here is the state:
        {{ state }}

        When the user specifies relative times, use the current time and their
        time delta to determine an absolute time. Never return a value like "1745877191 - 7200".
        Instead, return a value like "1745870191".

        When updating an item, you may be tempted to only fill out the fields
        that need chaning. But it's important instead to fill out all the fields.
        If you don't want to update a field, set it to the existing value.

        If the user mentions finishing an item that isn't on the list, inform them that
        it's not on the list. Prefix that messages with "UNKWOWN ITEM".

        {{ ctx.output_format }}

        {{ _.role('user')}}
        User query: {{ query.message }}
        That message was sent at {{ query.date_time }}
    "#
}

test TimeOutput {
    functions [SelectTools]
    args {
        state {
            tool_history []
            todo_list {
                items [{
                    id 1
                    title "Read a book"
                    created_at 171927000
                    completed_at null
                    deleted false
                    tags [Errand]
                }]
            }
        }
        query {
            message "I finished going to the gym 2 hours ago"
            date_time 171927200
        }
    }
}

test NewFirstItem {
    functions [SelectTools]
    args {
        state {
            tool_history []
            todo_list {
                items []
            }
        }
        query {
            message "Add 'Take otu the trash' to Errand"
            date_time 1719225600
        }
    }
}

test NewAdvice {
    functions [SelectTools]
    args {
        state {
            tool_history []
            todo_list {
                items []
            }
        }
        query {
            message "Help"
            date_time 1719225600
        }
    }
}

test CompleteSecondItem {
    functions [SelectTools]
    args {
        state {
            tool_history []
            todo_list {
                items [
                    {
                        id 1
                        title "Take out the trash"
                        created_at 1719225600
                        completed_at null
                        deleted false
                        tags [Errand]
                    },
                    {
                        id 2
                        title "Buy groceries"
                        created_at 1719225600
                        completed_at null
                        deleted false
                        tags [Errand]
                    }
                ]
            }
        }
        query {
            message "I bought the groceries 5 hours ago"
            date_time 1719225600
        }
    }
}
