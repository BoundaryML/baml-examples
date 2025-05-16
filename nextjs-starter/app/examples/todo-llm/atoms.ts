import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { State } from '../../../baml_client/types';

const stateAtom = atomWithStorage<
  State & { running: boolean; messages: string[] }
>('todoState', {
  tool_history: [],
  todo_list: { items: [] },
  running: false,
  messages: [],
});

export { stateAtom };
