"use client";
import { answerQuestion } from "@/app/actions/extract";
import {
  Citation,
  Document,
} from "@/baml_client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";
import { useStream } from "@/app/_hooks/useStream";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { documents } from "@/lib/rag-docs";
import clsx from "clsx";
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