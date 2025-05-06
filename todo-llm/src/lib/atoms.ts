import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { State, TodoList } from '../../baml_client';

const todoListAtom = atomWithStorage<TodoList>('todoList', { items: [] });

const messagesToUserAtom = atom<string[]>([]);

const stateAtom = atomWithStorage<
  State & { running: boolean; messages: string[] }
>('todoState', {
  tool_history: [],
  todo_list: { items: [] },
  running: false,
  messages: [],
});

export { todoListAtom, messagesToUserAtom, stateAtom };
