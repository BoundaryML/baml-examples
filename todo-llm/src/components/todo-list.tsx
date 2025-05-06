import { Checkbox } from "@/components/ui/checkbox";
import { stateAtom } from "@/lib/atoms";
import { formatDistanceToNow } from "date-fns";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import type * as types from "../../baml_client/types";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessagesToUser } from "./message-list";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export function TodoList(props: {
  onCheckboxClick: (item_id: string) => void;
  onRun: (message: string) => void;
  onReset: () => void;
}) {
  const [state] = useAtom(stateAtom);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2 mb-4 w-full">
        <div className="flex w-full gap-2">
          <Input
            value={message}
            className="text-xl"
            placeholder="What needs to be done?"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onRun(message);
                setMessage("");
              }
            }}
          />
          <Button
            disabled={state.running}
            variant="default"
            onClick={() => {
              props.onRun(message);
              setMessage("");
            }}
          >
            {state.running ? "Pending..." : "Send"}
          </Button>
          <Button variant="outline"  onClick={props.onReset}>
            Reset
          </Button>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2 border border-border rounded-lg shadow-sm p-4">
          <AnimatePresence mode="popLayout">
            {state.todo_list.items.map((item) => (
              <motion.div key={`todo-${item.id}`} variants={itemVariants} layout>
                <TodoItem item={item} onCheckboxClick={props.onCheckboxClick} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="text-sm text-muted-foreground mt-4">
            {state.todo_list.items.filter((item) => !item.completed_at).length}{" "}
            items left!
          </div>
        </div>
        <div className="w-1/2">
          <MessagesToUser />
        </div>
      </div>
    </div>
  );
}

export function TodoItem(props: {
  item: types.TodoItem;
  onCheckboxClick: (item_id: string) => void;
}) {
  const isCompleted = props.item.completed_at != null;

  return (
    <div
      // variants={itemVariants}
      // layout
      className="flex justify-between gap-3 py-2 border-b border-border last:border-b-0"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isCompleted}
            id={`todo-${props.item.id}`}
            onCheckedChange={() => props.onCheckboxClick(props.item.id)}
            className="h-5 w-5"
          />
          <Label
            htmlFor={`todo-${props.item.id}`}
            className={`flex-1 ${
              isCompleted ? "text-muted-foreground line-through" : ""
            }`}
          >
            {props.item.title}
          </Label>
        </div>
        <span className="text-xs text-muted-foreground">
          {props.item.completed_at
            ? `Completed ${formatDistanceToNow(
                new Date(props.item.completed_at * 1000)
              )} ago`
            : "Not completed"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {props.item.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
