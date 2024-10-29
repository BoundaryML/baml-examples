"use client";
import { answerQuestion } from "@/app/actions/streamable_objects";
import { useState } from "react";
import { useStream } from "@/app/_hooks/useStream";
import examples from "./examples";
import { Content } from "./Content";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Home: React.FC = () => {
  const [text, setText] = useState(examples.basic.value);
  const answer = useStream(answerQuestion);

  return (
    <Content
      question={text}
      setQuestion={setText}
      answerAction={answer}
    />
  );
}

export default Home;