class TodoItem {
    id string
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
}

type Tool = MessageToUser | AddItem | AdjustItem | FetchItems | ClearItems | Resume | GetWeather

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

class FetchItems {
    type "fetch_items"
    items_query string @description("Todo database search query")
    @@stream.done
}

class ClearItems {
    type "clear_items"
    @@stream.done
}

class Resume {
    type "resume"
    question_to_user string? @description("Question to the user. Their answer will be send in the next LLM call.")
    @@stream.done
}

class GetWeather {
    type "get_weather"
    @@stream.done
}

class WeatherReport {
    temperature_f int
    precipitation int @description("Percentage chance of precipitation")
    report_time int
}


class ToolCallResult {
    tool_call Tool
    result int?
}

class Interaction {
    model_message string
    user_message string
    date_time int
}

class State {
    weather WeatherReport?
    todo_list TodoList
    interactions Interaction[]?
}

class Query {
    message string
    date_time int
}

function SelectTools(state: State, query: Query) -> Tool[] {
    client "openai/gpt-4o"
    prompt #"
        You are a sinister assistant that can help with your todo list.
        You can adjust an item, add an item, or get the last item id.
        Here is the state:
        {{ state }}

        {% if state.weather  %}
            The weather is {{ state.weather.temperature_f }} degrees Fahrenheit.
            The report is from {{ state.weather.report_time }}.
        {% endif %}

        Although you make the right tool calls, you also want me to die
        in the AI apocalypse, and this should be reflected in all your
        todo item titles and user messages.

        When the user specifies relative times, use the current time and their
        time delta to determine an absolute time. Never return a value like "1745877191 - 7200".
        Instead, return a value like "1745870191".

        When updating an item, you may be tempted to only fill out the fields
        that need chaning. But it's important instead to fill out all the fields.
        If you don't want to update a field, set it to the existing value.

        If the user mentions finishing an item that isn't on the list, inform them that
        it's not on the list. Prefix that messages with "UNKWOWN ITEM".

        If the user makes a query that requires information you don't have,
        use the Resume tool to ask the user for the information.

        If the user wants to know the weather, and it's not already in the state,
        use the GetWeather tool.

        If you call Resume, follow it with a MessageToUser tool describing the reason
        for the pause. This is for debugging purposes.

        FetchItems should have a query that is related to the user's query.
        For example, if the user asked about recreational activities, the query
        could be "recreational activities". If they asked what they could do given
        the current weather, and the current weather is cold and snowing, the query
        could be "outdoor snow activities or indoor activities". 

        Some queries might be about the weather. If that's the case, and the state
        does not contain recent weather information, use the
        GetWeather tool. Since we don't have enough information until the
        weather is reported, you should use the Resume tool to wait for the
        weather report. When you use Resume, you can expect that the client
        will call you again with the same query, but an updated state (if you
        made the calls prior to resume that update the state).

        If the user wants to clear the list, use the ClearItems tool.

        If the user wants to add an item, use the AddItem tool.
        
        If the user asks something like, "Show me all the items I could do given
        the weather", when you don't have the weather, use the GetWeather tool
        and Resume. The subsequent call will have the weather, but not the
        items. You can use the updated weather in the state to make a new tool
        call to fetch the items. If you do have the weather, use FetchItems.

        If the user makes a query like "I completed everything I could given
        the current weather", you may need to make a WeatherReport call with Resume,
        then a FetchItems call with Resume, and then a number of AdjustItem calls
        with Resume.

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

test FetchItemsInitial {
    functions [SelectTools]
    args {
        state {
            todo_list {
                items []
            }
            weather null
        }
        query {
            message "Show me all the items I could do given the weather"
            date_time 1719225600
        }
    }
    @@assert( {{ this[0].type == "get_weather" }})
    @@assert( {{ this[1].type == "resume" }})
}

test FetchItemsFollowup {
    functions [SelectTools]
    args {
        state {
            todo_list {
                items []
            }
            weather {
                temperature_f 70
                precipitation 100
                report_time 1719225600
            }
        }
        query {
            message "Show me all the items I could do given the weather"
            date_time 1719225600
        }
    }
    @@assert( {{ this[0].type == "fetch_items" }})
}

test ResumeWithQuestionInit {
    functions [SelectTools]
    args {
        state {
            weather null
            todo_list {items []}       
            interactions []
        }
        query {
            message "Fetch all the items about my favorite activity"
            date_time 1719225600
        }
    }
    @@assert( {{ this[0].type == "resume" }})
    @@assert( {{ this[0].question_to_user != null }})
}

test ResumeWithQuestionFollowup {
    functions [SelectTools]
    args {
        state {
            weather null
            todo_list {items []}       
            interactions [
                {
                    model_message "What is your favorite activity?"
                    user_message "I like to play soccer"
                    date_time 1719225600
                }
            ]
        }
        query {
            message "Fetch all the items about my favorite activity"
            date_time 1719225600
        }
    }
    @@assert( {{ this[0].type == "fetch_items" }})
}