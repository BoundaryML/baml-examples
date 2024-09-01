import { useState, useEffect } from "react";
import { readStreamableValue, StreamableValue } from "ai/rsc";

/**
 * A hook that streams data from a server action. The server action must return a StreamableValue.
 * See the example action in app/actions/streamable_objects.tsx
 *  **/
export function useStream<T, P extends any[]>(
  serverAction: (...args: P) => Promise<{ object: StreamableValue<Partial<T>, any> }>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [partialData, setPartialData] = useState<Partial<T> | undefined>(undefined); // Initialize data state
  const [data, setData] = useState<T | undefined>(undefined); // full non-partial data

  const mutate = async (
    ...params: Parameters<typeof serverAction>
  ): Promise<T | undefined> => {
    console.log("mutate", params);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const { object } = await serverAction(...params);
      const asyncIterable = readStreamableValue(object);

      let streamedData: Partial<T> | undefined;
      for await (const value of asyncIterable) {
        if (value !== undefined) {

          // could also add a callback here.
          // if (options?.onData) {
          //   options.onData(value as T);
          // }
          console.log("value", value);
          streamedData = value;
          setPartialData(streamedData); // Update data state with the latest value
        }
      }


      setIsComplete(true);
      setData(streamedData as T);
      // If it completes, it means it's the full data.
      return streamedData as T;
    } catch (err) {
      console.log("error", err);

      setIsError(true);
      setError(new Error(JSON.stringify(err) ?? "An error occurred"));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  // If you use the "data" property, your component will re-render when the data gets updated.
  return { data, partialData, isLoading, isComplete, isError, error, mutate };
}
