'use client';

import { MessagesToUser } from '@/components/message-list';
import { TodoList } from '@/components/todo-list';
import { stateAtom, todoListAtom } from '@/lib/atoms';
import { useSetAtom } from 'jotai';
import { useTodoToolHandler } from './tool-handler';
import { StateDialog } from './state-dialog';
import { AnimatedBackground } from './animated-background';

export function TodoInterface() {
  const { onUserQuery, onCheckboxClick } = useTodoToolHandler();
  const setTodoList = useSetAtom(todoListAtom);
  const setState = useSetAtom(stateAtom);

  const handleReset = () => {
    setTodoList({ items: [] });
    setState({
      tool_history: [],
      todo_list: { items: [] },
      running: false,
      messages: [],
    });
  };

  return (
    <div className="container mx-auto w-[80%] p-5">
      <div className="flex flex-col w-full">
        <div className="w-full flex flex-row justify-center items-center gap-4 mb-6">
          <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-[0_0_0.3rem_#ffffff70]">
            TODO-LLM
          </h1>
          <StateDialog />
        </div>

        <div className="flex  gap-4 w-full mx-auto">
            <TodoList onCheckboxClick={onCheckboxClick} onRun={onUserQuery} onReset={handleReset} />
        </div>

      </div>
    </div>
  );
}
