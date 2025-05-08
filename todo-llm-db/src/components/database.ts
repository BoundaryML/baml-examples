'use server'

import { tursoClient, createEmbeddings } from "@/lib/tursoClient";
import { TodoItem } from "../../baml_client/types";


export async function createTodos(todoItems: TodoItem[], user: string | null) {
    
    const client = tursoClient();

    const embeddings = await createEmbeddings(
        todoItems.map((item) => `${item.title} Tags: ${JSON.stringify(item.tags)}`)
    );

    for (let i = 0; i < todoItems.length; i++) {
        const todoItem = todoItems[i];
        const embedding = embeddings[i];
        
        const completedAt = todoItem.completed_at ?? null;
        const todoItemTags = JSON.stringify(todoItem.tags);
         
        // Convert the embedding array to a JSON string for the vector32 function
        // The vector32 function expects a string representation of an array
        await client.execute(
            "INSERT INTO todos (id, title, created_at, completed_at, deleted, tags, embedding) VALUES (?, ?, ?, ?, ?, ?, vector32(?))",
            [todoItem.id, todoItem.title, todoItem.created_at, completedAt, todoItem.deleted, todoItemTags, JSON.stringify(embedding)]
        );

        if (user) {
            await client.execute(
                "INSERT INTO user_todos (user, todo) VALUES (?, ?)",
                [user, todoItem.id]
            );
        }
    }
    
    return { success: true };
}

export async function resetItems(user: string | null) {
    // const client = tursoClient();
    // if (user) {
    //     const todo_ids_rows = await client.execute("SELECT id FROM user_todos WHERE user = ?", [user]);
    //     const todo_ids: string = JSON.stringify(todo_ids_rows.rows.map((row) => row[0] as string));
    //     await client.execute("DELETE FROM todos WHERE id in ?", [todo_ids]);
    // } else {
    //     const todo_ids_rows = await client.execute(`
    //         SELECT id FROM todos
    //         LEFT JOIN user_todos ON todos.id = user_todos.todo
    //         WHERE user_todos.user is null
    //         `)
    //     const todo_ids: string = JSON.stringify(todo_ids_rows.rows.map((row) => row[0] as string));
    //     await client.execute("DELETE FROM todos WHERE id in ?", [todo_ids]);
    // }
}

export async function nearestTodos(query: string, user: string | null, limit: number): Promise<TodoItem[]> {
    const client = tursoClient();
    console.log("nearestTodos")
    const query_embedding = (await createEmbeddings([query]))[0];
    const query_embedding_string = JSON.stringify(query_embedding);
    console.log("About to run nearestTodos: ", query);
    
    // Different query based on whether user is null or not
    let results;
    if (user) {
        results = await client.execute(
            `SELECT
                id,
                title,
                created_at,
                completed_at,
                deleted,
                tags,
                vector_extract(embedding) as row_embedding
            FROM
                todos
            LEFT JOIN
                user_todos u
            ON
                todos.id = u.todo
            WHERE
                u.user = ?
            ORDER BY
                vector_distance_cos(row_embedding, vector32(?))
            LIMIT (?)`,
            [user, query_embedding_string, limit]
        );
    } else {
        // When user is null, don't filter by user
        results = await client.execute(
            `SELECT
                id,
                title,
                created_at,
                completed_at,
                deleted,
                tags,
                vector_extract(embedding) as row_embedding
            FROM
                todos
            ORDER BY
                vector_distance_cos(row_embedding, vector32(?))
            LIMIT (?)`,
            [query_embedding_string, limit]
        );
    }

    const res = results.rows.map((row) => ({
        id: row.id as string,
        title: row.title as string,
        created_at: row.created_at as number,
        completed_at: row.completed_at as number | null,
        deleted: false,
        tags: JSON.parse(row.tags as string),
    }));

    console.log(res);

    return res;
}