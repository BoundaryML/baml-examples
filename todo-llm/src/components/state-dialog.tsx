'use client';

import { useAtomValue } from 'jotai';
import { stateAtom, todoListAtom } from '@/lib/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { SettingsIcon } from 'lucide-react';

export function StateDialog() {
  const state = useAtomValue(stateAtom);
  const todoList = useAtomValue(todoListAtom);

  const combinedState = {
    state,
    todoList,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application State</DialogTitle>
        </DialogHeader>
        <pre className="p-4 mt-4 overflow-auto text-sm bg-secondary rounded-lg max-h-[60vh]">
          {JSON.stringify(combinedState, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}