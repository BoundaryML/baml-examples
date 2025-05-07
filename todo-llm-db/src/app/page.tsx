"use client";

import { TodoInterface } from '@/components/todo-app';
import { createTodos, nearestTodos } from '@/components/database';
import { useEffect } from 'react';

export default function Home() {
  // useEffect(() => {
  //   runDatabaseTests();
  // }, []);

  return <TodoInterface />;
}

async function runDatabaseTests() {
  const createInitialTodos = async () => {
    console.log("Creating todos");
    console.log(process.env);
    const res = await createTodos([{
      id: crypto.randomUUID(),
      title: "Walk the dog", 
      created_at: 123,
      completed_at: null,
      deleted: false,
      tags: []
    },
    {
      id: crypto.randomUUID(),
      title: "Paint a picture", 
      created_at: 123,
      completed_at: null,
      deleted: false,
      tags: []
    }
  ], null);
    console.log("Todos created", res);
    await createTodos([{
      id: crypto.randomUUID(),
      title: "Juggle", 
      created_at: 123,
      completed_at: null,
      deleted: false,
      tags: []
    }], "greg");
  };

  const initialQuery = async () => {
    console.log("querying todos");
    const res = await nearestTodos("Art", null, 2);
    console.log("Unauthenticated Todos queried", res);
  }

  const gregQuery = async () => {
    console.log("querying todos");
    const res = await nearestTodos("Fun", "greg", 2);
    console.log("Greg Todos queried", res);
  }

  createInitialTodos();
  initialQuery();
  gregQuery();
}