import { useState, useEffect } from "react";
import { StreamableValue } from "ai/rsc";

interface StreamResult<T> {
  isLoading: boolean;
  isComplete: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

async function* readAsyncIterable<T>(
  asyncIterable: AsyncIterable<T | undefined>
): AsyncGenerator<T, void, undefined> {
  for await (const value of asyncIterable) {
    if (value !== undefined) {
      yield value;
    }
  }
}

export function useStream<T>(
  streamGenerator: () => Promise<AsyncIterable<T | undefined>>,
  options?: { onData?: (data: T) => void }
): StreamResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const asyncIterable = await streamGenerator();
      const iterator = readAsyncIterable(asyncIterable);

      for await (const value of iterator) {
        if (options?.onData) {
          options.onData(value);
        }
      }

      setIsComplete(true);
    } catch (err) {
      console.log("error", err);
      setIsError(true);
      setError(new Error(JSON.stringify(err) ?? "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isComplete, isError, error, mutate };
}
