import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Query, State } from '../../baml_client';

enum Phase {
  Running = "running",
  Awaiting = "awaiting",
  Interacting = "interacting",
}

const stateAtom = atomWithStorage<
  State & { query: Query | null, phase: Phase; messages: string[] }
>('todoState', {
  todo_list: { items: [] },
  phase: Phase.Awaiting ,
  messages: [],
  query: null,
});

// An atom that contains the original query the user made, as well as the
// message to the user that was returned from the LLM in the Resume tool,
// if there was one.
const resumeAtom = atom<{
  query: Query,
  message_to_user: string | null
} | null>(null);

const loggedInUserAtom = atom<string | null>(null);

export { stateAtom, resumeAtom, loggedInUserAtom, Phase };
