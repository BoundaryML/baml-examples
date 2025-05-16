'use client';

import { MessagesToUser } from './message-list';
import { TodoList } from './todo-list';
import { stateAtom } from './atoms';
import { useSetAtom } from 'jotai';
import { useTodoToolHandler } from './tool-handler';

export function TodoInterface() {
  const { onUserQuery, onCheckboxClick } = useTodoToolHandler();
  const setState = useSetAtom(stateAtom);

  const handleReset = () => {
    setState({
      tool_history: [],
      todo_list: { items: [] },
      running: false,
      messages: [],
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-5">
      <div className="flex flex-col w-full">
        <div className="w-full flex flex-row justify-center items-center gap-4 mb-6">
          <h1 className="text-4xl">
            TODO-LLM
          </h1>
        </div>

        <div className="flex  gap-4 max-w-3xl mx-auto w-full">
            <TodoList onCheckboxClick={onCheckboxClick} onRun={onUserQuery} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}
