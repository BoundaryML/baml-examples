import {
  createStreamableValue,
  StreamableValue as BaseStreamableValue,
} from "ai/rsc";
import { BamlStream } from "@boundaryml/baml";

// ------------------------------
// Helper functions
// ------------------------------

/**
 * Type alias for defining a StreamableValue based on a BamlStream.
 * It captures either a partial or final result depending on the stream state.
 */
type StreamableValue<T extends BamlStream<any, any>> =
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
export async function streamHelper<T extends BamlStream<any, any>>(
  bamlStream: T
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
      // Handle any errors during stream processing
      stream.error(JSON.stringify(err));
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
export function makeStreamable<
  BamlStreamFunc extends (...args: any) => BamlStream<any, any>
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
