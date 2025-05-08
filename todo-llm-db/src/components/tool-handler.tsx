'use client';

import { stateAtom, loggedInUserAtom, Phase, resumeAtom } from '@/lib/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useRef } from 'react';
import type { partial_types } from '../../baml_client/partial_types';
import { useSelectTools } from '../../baml_client/react/hooks';
import { b } from '../../baml_client/async_client';
import type * as types from '../../baml_client/types';
import { tursoClient } from '@/lib/tursoClient';
import * as db from './database';
import { Tool } from 'openai/resources/responses/responses.mjs';

// Helper functions for tool handling
const createTodoItem = async (title: string, tags: types.Tag[] = [], user: string | null): Promise<types.TodoItem> => {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const cuid2 = `c${randomStr}${Math.random().toString(36).substring(2, 12)}`.slice(0, 25);
  const item = {
    id: cuid2,
    title,
    tags,
    created_at: timestamp,
    completed_at: null,
    deleted: false,
  };
  await db.createTodos([item], user);
  return item;
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
  const [resume, setResume] = useAtom(resumeAtom);
  const user = useAtomValue(loggedInUserAtom);
  const finishedInstructionsRef = useRef(new Set<number>());
  const hookRef = useRef<any>(null);

  const handleAddItem = useCallback(
    async (tool: types.AddItem) => {
      const new_item = await createTodoItem(tool.title, tool.tags, user)
      setState((prevState) => ({
        ...prevState,
        todo_list: {
          ...prevState.todo_list,
          items: [
            ...prevState.todo_list.items,
            new_item,
          ],
        },
      }));
    },
    [setState],
  );

  const handleFetchItems = useCallback(async (tool: types.FetchItems) => {
    const items = await db.nearestTodos(tool.items_query, user, 5)
    setState((prevState) => {
      return ({
        ...prevState,
        todo_list: {
          ...prevState.todo_list,
          items: items,
        },
      })}
    )
   }, [setState]);

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

  const handleGetWeather = useCallback(
    (tool: types.GetWeather) => {
      setState((prevState) => ({
        ...prevState,
        weather: {
          temperature_f: 10,
          precipitation: 1,
          report_time: Math.floor(Date.now() / 1000),
        },
      }))
    },
    [setState],
  )

  const handleResume = useCallback(
    (tool: types.Resume) => {
      console.log("handleResume")
      setResume((prevResume) => ({
        ...prevResume,
        query: tool.original_query,
        message_to_user: tool.question_to_user ?? null,
      }))
      // console.log("resume from handleResume: ", JSON.stringify(resume))
    },
    [setResume],
  )

  const onStreamData = useCallback((chunk: any) => {
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
        case 'fetch_items':
          handleFetchItems(tool as types.FetchItems);
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
        case 'get_weather':
          handleGetWeather(tool as types.GetWeather);
          break;
        case 'resume':
          handleResume(tool as types.Resume);
          break;
      }

  }, [handleAddItem, handleAdjustItem, handleFetchItems, handleMessageToUser, handleGetWeather, handleResume])

  const onFinalData = useCallback(async (finalTools: any) => {
      let shouldResume = false;
      let varState: types.State | null = null;
      let varOriginalQuery: types.Query | null = null;
      setState((currentState) => {
        currentState 
        console.log("state: ", JSON.stringify(currentState))
        console.log("resume: ", JSON.stringify(resume))
        finishedInstructionsRef.current = new Set<number>();

        let has_resume_todo = finalTools?.some((tool: any) => tool.type === 'resume');
        if (!has_resume_todo) {
          console.log("no resume todo, resetting resume")
          setResume(null);
        }

        console.log("onFinalData");
        console.log("has_resume_todo:" , resume !== null)
        varState = currentState;
        varOriginalQuery = currentState.query;

        if (resume) {
          console.log("resuming")
          if (resume.message_to_user) {
            // Handle case where we need user input
            return {
              ...currentState,
              phase: Phase.Awaiting,
            };
          } else {
            // Resume with the stored query
            shouldResume = true;
            varState = currentState;
            varOriginalQuery = resume.query;
            
            return currentState;
          }
        } else {
          console.log("not resuming")
          return {
            ...currentState,
            phase: Phase.Awaiting,
          };
        }
      });
      shouldResume = finalTools.some((tool: any) => tool.type === 'resume');
      console.log("shouldResume: ", shouldResume)
      while (shouldResume) {
        console.log("varState: ", JSON.stringify(varState))
        console.log("varOriginalQuery: ", JSON.stringify(varOriginalQuery))
        if (varState && varOriginalQuery) {

          // const newHook = useSelectTools( {
          //   stream: true,
          //   onFinalData: (finalTools) => {
          //     console.log("Nested Final")
          //   },
          //   onStreamData: onStreamData,
          // })
          // newHook.mutate(varState, varOriginalQuery);

          // hookRef.current?.reset();
          shouldResume = false;
          hookRef.current?.mutate(varState, varOriginalQuery);
          // const next_response = b.stream.SelectTools(varState, varOriginalQuery)
          // for await (const chunk of next_response) {
          //   console.log("Followup chunk: ", JSON.stringify(chunk))
          //   onStreamData(chunk);
          // }
          // const final_response = await next_response.getFinalResponse();
          // console.log("Final response: ", JSON.stringify(final_response))

          // shouldResume = final_response.some((tool: any) => tool.type === 'resume');
          // console.log("shouldResume: ", shouldResume)
        }
      }
  }, [setState, resume, setResume])

  const hook = useSelectTools({
    stream: true,
    // onFinalData: (finalTools) => {

    //   console.log("state: ", JSON.stringify(state))
    //   console.log("resume: ", JSON.stringify(resume))
    //   finishedInstructionsRef.current = new Set<number>();

    //   let has_resume_todo = finalTools?.some((tool: any) => tool.type === 'resume');
    //   if (!has_resume_todo) {
    //     console.log("no resume todo, resetting resume")
    //     setResume(null);
    //   }

    //   console.log("onFinalData");
    //   console.log("has resume:" , resume !== null)
    //   if (resume) {
    //     console.log("resuming")
    //     if (resume.message_to_user) {
    //       // Handle case where we need user input
    //       setState((prevState) => ({
    //         ...prevState,
    //         phase: Phase.Awaiting,
    //       }));
    //     } else {
    //       // Resume with the stored query
    //       // hookRef.current?.mutate(state, resume.query);
    //       console.log("HERE IS WHERE I WANT TO RESUME")
    //     }
    //   } else {
    //     console.log("not resuming")
    //     setState((prevState) => ({
    //       ...prevState,
    //       phase: Phase.Awaiting,
    //     }));
    //   }
    // },
    onFinalData,
    onStreamData,
  });

  // Store the hook in the ref
  hookRef.current = hook;

  const onUserQuery = useCallback(
    async (message: string) => {
      const query = {
        message,
        date_time: Math.floor(Date.now() / 1000),
      }
      setState((prevState) => ({
        ...prevState,
        running: true,
        messages: [...prevState.messages, message, ''],
        query: query,
      }));

      if (resume) {
        if (resume.message_to_user) {
          // Handle case where we need user input
          setState((prevState) => ({
            ...prevState,
            phase: Phase.Awaiting,
          }));
        } else {
          hook.mutate(state, resume.query);
        }
      } else {
        hook.mutate(state, query);
      }
    },
    [hook, state, setState, resume],
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
