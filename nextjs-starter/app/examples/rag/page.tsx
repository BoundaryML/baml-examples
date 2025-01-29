"use client";
import type React from "react";
import { useState } from "react";
import examples from "./examples";
import { Content } from "./Content";
import { useAnswerQuestion } from "@/baml_client/react/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Home: React.FC = () => {
  const [text, setText] = useState(examples.basic.value);
  const answer = useAnswerQuestion({ stream: true });

  return (
    <Content
      question={text}
      setQuestion={setText}
      answerAction={answer}
    />
  );
}

export default Home;