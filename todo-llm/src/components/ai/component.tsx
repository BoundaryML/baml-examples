'use client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { type Todo, createTodos } from './actions';

interface TodoFormProps {
  onSubmit: (input: string) => Promise<void>;
  isLoading: boolean;
}

function TodoForm({ onSubmit, isLoading }: TodoFormProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    try {
      await onSubmit(input);
      setInput('');
    } catch (error) {
      console.error('Failed to create todos:', error);
      setError('Failed to create todos. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your tasks..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Create Tasks'
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </form>
  );
}

interface TodoCardProps {
  todo: Todo;
}

function TodoCard({ todo }: TodoCardProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <h3 className="font-medium">{todo.title}</h3>
      {todo.description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {todo.description}
        </p>
      )}
      {todo.dueDate && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Due: {new Date(todo.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

interface TodoListProps {
  todos: Todo[];
}

function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Generated Tasks</h2>
      <div className="grid gap-4">
        {todos.map((todo) => (
          <TodoCard key={todo.title} todo={todo} />
        ))}
      </div>
    </div>
  );
}

export function AiComponent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    try {
      const newTodos = await createTodos(input);
      setTodos(newTodos);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <TodoForm onSubmit={handleSubmit} isLoading={isLoading} />
      <TodoList todos={todos} />
    </div>
  );
}
