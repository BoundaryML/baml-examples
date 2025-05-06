'use server';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export type Todo = z.infer<typeof todoSchema>;

export async function createTodos(query: string) {
  const { elementStream } = streamObject({
    model: openai('gpt-4o-mini'),
    output: 'array',
    schema: todoSchema,
    prompt: `Generate a todo list based on this description: ${query}`,
  });

  const todos = [];

  for await (const partialObject of elementStream) {
    todos.push(partialObject);
  }

  return todos;
}
