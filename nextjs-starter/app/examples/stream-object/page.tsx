"use client";

import type React from "react";
import { useState } from "react";
import examples from "./examples";
import { Content } from "./Shared";
import { useExtractResume, useExtractResumeNoStructure } from "@/baml_client/react/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function Home() {
  const [resumeText, setResumeText] = useState<string>(examples.vaibhav.value);
  const structuredResume = useExtractResume({ stream: true });
  const unstructuredResume = useExtractResumeNoStructure({ stream: true });

  return (
    <Content
      resumeText={resumeText}
      setResumeText={setResumeText}
      isLoading={structuredResume.isPending || unstructuredResume.isPending}
      structured={structuredResume}
      unstructured={unstructuredResume}
    />
  );
};
