"use server";
import { createStreamableValue, type StreamableValue as BaseStreamableValue } from "ai/rsc";
import type { BamlStream } from "@boundaryml/baml";
import { b } from "@/baml_client";

export const analyzeBooks = makeStreamable(b.stream.AnalyzeBooks.bind(b.stream));
export const getRecipe = makeStreamable(b.stream.GetRecipe.bind(b.stream));
export const answerQuestion = makeStreamable(b.stream.AnswerQuestion.bind(b.stream));
export const extractResume = makeStreamable(b.stream.ExtractResume.bind(b.stream));
export const extractResumeNoStructure = makeStreamable(b.stream.ExtractResumeNoStructure.bind(b.stream));
export const generateGuide = makeStreamable(b.stream.GenerateGuide.bind(b.stream));

// ------------------------------
// Helper functions
// ------------------------------

/**
 * Type alias for defining a StreamableValue based on a BamlStream.
 * It captures either a partial or final result depending on the stream state.
 */
export type StreamableValue<T extends BamlStream<any, any>> =
  | { partial: T extends BamlStream<infer StreamRet, any> ? StreamRet : never }
  | { final: T extends BamlStream<any, infer Ret> ? Ret : never };

/**
 * Helper function to manage and handle a BamlStream.
 * It consumes the stream, updates the streamable value for each partial event,
 * and finalizes the stream when complete.
 *
 * @param bamlStream - The BamlStream to be processed.
 * @returns A promise that resolves with an object containing the BaseStreamableValue.
 */
async function streamHelper<T extends BamlStream<any, any>>(
  bamlStream: T,
): Promise<{
  object: BaseStreamableValue<StreamableValue<T>>;
}> {
  const stream = createStreamableValue<StreamableValue<T>>();

  // Asynchronous function to process the BamlStream events
  (async () => {
    try {
      // Iterate through the stream and update the stream value with partial data
      for await (const event of bamlStream) {
        stream.update({ partial: event });
      }

      // Obtain the final response once all events are processed
      const response = await bamlStream.getFinalResponse();
      stream.done({ final: response });
    } catch (err) {
      stream.error(err);
    }
  })();

  return { object: stream.value };
}

/**
 * Utility function to create a streamable function from a BamlStream-producing function.
 * This function returns an asynchronous function that manages the streaming process.
 *
 * @param func - A function that produces a BamlStream when called.
 * @returns An asynchronous function that returns a BaseStreamableValue for the stream.
 */
function makeStreamable<
  BamlStreamFunc extends (...args: any) => BamlStream<any, any>,
>(
  func: BamlStreamFunc
): (...args: Parameters<BamlStreamFunc>) => Promise<{
  object: BaseStreamableValue<StreamableValue<ReturnType<BamlStreamFunc>>>;
}> {
  return async (...args) => {
    const stream = func(...args);
    return streamHelper(stream);
  };
}
