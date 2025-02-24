"use client";

import { useAnalyzeBooks } from "@/baml_client/react/client";
import type React from "react";
import { useState } from "react";
import { Content } from "./Shared";
import examples from "./examples";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Home: React.FC = () => {
	const [query, setQuery] = useState<string>(examples[0].query);
	const books = useAnalyzeBooks({ stream: true });

	return <Content query={query} setQuery={setQuery} answer={books} />;
};

export default Home;
