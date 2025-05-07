import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { State } from '../../baml_client';

const stateAtom = atomWithStorage<
  State & { running: boolean; messages: string[] }
>('todoState', {
  todo_list: { items: [] },
  running: false,
  messages: [],
});

// An atom that contains the original query the user made, as well as the
// message to the user that was returned from the LLM in the Resume tool,
// if there was one.
const resumeAtom = atom<{
  query: string,
  date_time: number,
  message_to_user: string | null
} | null>(null);

const loggedInUserAtom = atom<string | null>(null);

export { stateAtom, resumeAtom, loggedInUserAtom };
