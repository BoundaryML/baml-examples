"use client";

import type React from "react";
import { useState } from "react";
import examples from "./examples";
import { Content } from "./Shared";
import { useGetRecipe } from "@/baml_client/react/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Home: React.FC = () => {
  const [query, setQuery] = useState<string>(examples[0].query);
  const recipie = useGetRecipe({ stream: true });

  return (
    <Content
      query={query}
      setQuery={setQuery}
      answer={recipie}
    />
  );
};

export default Home;
