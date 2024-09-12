"use server";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { Answer, b, BookAnalysis, Resume, Recipe } from "@/baml_client";
import { documents } from "@/lib/rag-docs";
import { BamlStream } from "@boundaryml/baml";
import { makeStreamable } from "../_baml_utils/streamableObjects";

export const extractResume = makeStreamable(b.stream.ExtractResume);
export const extractUnstructuredResume = makeStreamable(
  b.stream.ExtractResumeNoStructure
);
export const analyzeBook = makeStreamable(b.stream.AnalyzeBooks);
export const answerQuestion = makeStreamable(b.stream.AnswerQuestion);
export const getRecipe = makeStreamable(b.stream.GetRecipe);
