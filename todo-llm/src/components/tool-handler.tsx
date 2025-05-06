'use client';

import { stateAtom } from '@/lib/atoms';
import { useAtom } from 'jotai';
import { useCallback, useRef } from 'react';
import type { partial_types } from '../../baml_client/partial_types';
import { useSelectTools } from '../../baml_client/react/hooks';
import type * as types from '../../baml_client/types';

// Helper functions for tool handling
const createTodoItem = (title: string, tags: string[] = []): types.TodoItem => {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const cuid2 = `c${randomStr}${Math.random().toString(36).substring(2, 12)}`.slice(0, 25);
  return {
    id: cuid2,
    title,
    tags,
    created_at: timestamp,
    completed_at: null,
    deleted: false,
  };
};

const updateTodoItem = (
  item: types.TodoItem,
  updates: Partial<types.TodoItem>,
): types.TodoItem => ({
  ...item,
  ...updates,
  tags: updates.tags ?? item.tags,
});

export function useTodoToolHandler() {
  const [state, setState] = useAtom(stateAtom);
  const finishedInstructionsRef = useRef(new Set<number>());

  const handleAddItem = useCallback(
    (tool: types.AddItem) => {
      setState((prevState) => ({
        ...prevState,
        todo_list: {
          ...prevState.todo_list,
          items: [
            ...prevState.todo_list.items,
            createTodoItem(tool.title, tool.tags),
          ],
        },
      }));
    },
    [setState],
  );

  const handleAdjustItem = useCallback(
    (tool: types.AdjustItem) => {
      setState((prevState) => ({
        ...prevState,
        todo_list: {
          ...prevState.todo_list,
          items: prevState.todo_list.items.map((item) =>
            item.id === tool.item_id
              ? updateTodoItem(item, {
                  title: tool.title ?? undefined,
                  completed_at: tool.completed_at ?? undefined,
                  deleted: tool.deleted ?? undefined,
                  tags: tool.tags ?? undefined,
                })
              : item,
          ),
        },
      }));
    },
    [setState],
  );

  const handleMessageToUser = useCallback(
    (tool: partial_types.MessageToUser) => {
      setState((prevState) => ({
        ...prevState,
        messages: prevState.messages.map((msg, idx) =>
          idx === prevState.messages.length - 1 ? tool.message.value : msg,
        ),
      }));

      if (tool.message.state === 'Complete') {
        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, ''],
        }));
      }
    },
    [setState],
  );

  const hook = useSelectTools({
    stream: true,
    onFinalData: () => {
      hook.reset();
      finishedInstructionsRef.current = new Set<number>();
      setState((prevState) => ({
        ...prevState,
        running: false,
      }));
    },
    onStreamData: (chunk) => {
      if (!chunk?.length) return;

      const tool_id = chunk.length - 1;
      const tool = chunk[tool_id];

      if (finishedInstructionsRef.current.has(tool_id)) return;

      switch (tool?.type) {
        case 'add_item':
          handleAddItem(tool as types.AddItem);
          finishedInstructionsRef.current.add(tool_id);
          break;
        case 'adjust_item':
          handleAdjustItem(tool as types.AdjustItem);
          finishedInstructionsRef.current.add(tool_id);
          break;
        case 'message_to_user':
          handleMessageToUser(tool as partial_types.MessageToUser);
          if (
            (tool as partial_types.MessageToUser).message.state === 'Complete'
          ) {
            finishedInstructionsRef.current.add(tool_id);
          }
          break;
      }
    },
  });

  const onUserQuery = useCallback(
    async (message: string) => {
      setState((prevState) => ({
        ...prevState,
        running: true,
        messages: [...prevState.messages, message, ''],
      }));

      hook.mutate(state, {
        message,
        date_time: Math.floor(Date.now() / 1000),
      });
    },
    [hook, state, setState],
  );

  const onCheckboxClick = useCallback(
    async (item_id: string) => {
      setState((prevState) => ({
        ...prevState,
        todo_list: {
          ...prevState.todo_list,
          items: prevState.todo_list.items.map((item) =>
            item.id === item_id
              ? updateTodoItem(item, {
                  completed_at: item.completed_at
                    ? null
                    : Math.floor(Date.now() / 1000),
                })
              : item,
          ),
        },
      }));
    },
    [setState],
  );

  return {
    onUserQuery,
    onCheckboxClick,
  };
}
