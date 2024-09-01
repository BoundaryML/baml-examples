"use server";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { Answer, b, BookAnalysis, Resume, Recipe } from "@/baml_client";
import { documents } from "@/lib/rag-docs";
import { BamlStream } from "@boundaryml/baml";

const MAX_ERROR_LENGTH = 3000;
const TRUNCATION_MARKER = "[ERROR_LOG_TRUNCATED]";

function truncateError(error: string): string {
  if (error.length <= MAX_ERROR_LENGTH) return error;
  const halfLength = Math.floor(
    (MAX_ERROR_LENGTH - TRUNCATION_MARKER.length) / 2
  );
  return (
    error.slice(0, halfLength) + TRUNCATION_MARKER + error.slice(-halfLength)
  );
}
// type NullablePartial<T> = {
//   [P in keyof T]?: T[P] | null;
// };
type BamlStreamReturnType<T> = T extends BamlStream<infer P, any> ? P : never;

type StreamFunction<T> = (...args: any[]) => BamlStream<T, any>;

async function streamHelper<T>(
  streamFunction: (...args: any[]) => BamlStream<T, any>,
  ...args: Parameters<typeof streamFunction>
): Promise<{
  object: StreamableValue<Partial<T>>;
}> {
  console.log("streamHelper", streamFunction, args);
  const stream = createStreamableValue<T>();

  (async () => {
    try {
      const bamlStream = streamFunction(...args);
      for await (const event of bamlStream) {
        console.log("event", event);
        if (event) {
          stream.update(event as T);
        }
      }
      const response = await bamlStream.getFinalResponse();
      stream.update(response as T);
      stream.done();
    } catch (err) {
      const errorMsg = truncateError((err as Error).message);
      console.log("error", errorMsg);
      stream.error(errorMsg);
    }
  })();

  return { object: stream.value };
}

const streamableFunctions = {
  extractResume: b.stream.ExtractResume,
  extractUnstructuredResume: b.stream.ExtractResumeNoStructure,
  analyzeBook: b.stream.AnalyzeBooks,
  answerQuestion: b.stream.AnswerQuestion,
  getRecipe: b.stream.GetRecipe,
} as const;

type StreamableFunctionName = keyof typeof streamableFunctions;

function createStreamableFunction<T extends StreamableFunctionName>(
  functionName: T
): (...args: Parameters<(typeof streamableFunctions)[T]>) => Promise<{
  object: StreamableValue<
    Partial<BamlStreamReturnType<ReturnType<(typeof streamableFunctions)[T]>>>
  >;
}> {
  return async (...args) =>
    // need to bind to b.stream since we lose context here.
    streamHelper(
      streamableFunctions[functionName].bind(b.stream) as any,
      ...args
    );
}

export const extractResume = createStreamableFunction("extractResume");
export const extractUnstructuredResume = createStreamableFunction(
  "extractUnstructuredResume"
);
export const analyzeBook = createStreamableFunction("analyzeBook");
export const answerQuestion = createStreamableFunction("answerQuestion");
export const getRecipe = createStreamableFunction("getRecipe");
