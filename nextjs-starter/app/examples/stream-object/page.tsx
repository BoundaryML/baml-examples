"use client";

import React, { useState } from "react";
import examples from "./examples";
import { useStream } from "@/app/_hooks/useStream";
import {
  extractResume,
  extractResumeNoStructure,
} from "@/app/actions/streamable_objects";
import { Content } from "./Shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Home: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>(examples.vaibhav.value);
  const structuredResume = useStream(extractResume);
  const unstructuredResume = useStream(extractResumeNoStructure);

  return (
    <Content
      resumeText={resumeText}
      setResumeText={setResumeText}
      isLoading={structuredResume.isLoading || unstructuredResume.isLoading}
      structred={structuredResume}
      unstructured={unstructuredResume}
    />
  );
};

export default Home;