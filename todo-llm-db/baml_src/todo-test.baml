
class MyTodo {
    title string
    description string
    dueDate string
}

function CreateTodos(query: string) -> MyTodo{
    client "openai/gpt-4o"
    prompt #"
        Create a todo list from the user's query.
        Here is the query:
        {{ ctx.output_format }}
        {{ query }}
    "#
}

test CreateTodosTest {
    functions [CreateTodos]
    args {
        query "I need to buy groceries and go to the gym"
    }
}
