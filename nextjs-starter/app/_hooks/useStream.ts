import { useState, useMemo } from "react";
import {
  readStreamableValue,
  StreamableValue as BaseStreamableValue,
} from "ai/rsc";
import { StreamableValue } from "../actions/streamable_objects";
import type { BamlStream } from "@boundaryml/baml";

type PartialType<
  T extends BaseStreamableValue<StreamableValue<BamlStream<any, any>>>
> = T extends BaseStreamableValue<
  StreamableValue<BamlStream<infer PartialRet, any>>
>
  ? PartialRet
  : never;
type FinalType<
  T extends BaseStreamableValue<StreamableValue<BamlStream<any, any>>>
> = T extends BaseStreamableValue<
  StreamableValue<BamlStream<any, infer FinalRet>>
>
  ? FinalRet
  : never;

export type BamlStreamFunction = (...args: any) => Promise<{
  object: BaseStreamableValue<StreamableValue<BamlStream<any, any>>>;
}>;

export type StreamState<T extends BamlStreamFunction> = {
  data: FinalType<Awaited<ReturnType<T>>["object"]> | undefined;
  streamingData: PartialType<Awaited<ReturnType<T>>["object"]> | undefined;
  status: "idle" | "loading" | "success" | "error";
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  mutate: (
    ...params: Parameters<T>
  ) => Promise<FinalType<Awaited<ReturnType<T>>["object"]> | undefined>;
};

/**
 * A hook that streams data from a server action. The server action must return a StreamableValue.
 */
export function useStream<T extends BamlStreamFunction>(serverAction: T): StreamState<T> {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);
  const [partialData, setPartialData] =
    useState<PartialType<Awaited<ReturnType<T>>["object"]>>();
  const [data, setData] =
    useState<FinalType<Awaited<ReturnType<T>>["object"]>>();

  const isLoading = useMemo(() => status === "loading", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);

  const mutate = async (
    ...params: Parameters<T>
  ): Promise<FinalType<Awaited<ReturnType<T>>["object"]> | undefined> => {
    setStatus("loading");
    setData(undefined);
    setPartialData(undefined);
    setError(null);

    try {
      const { object } = await serverAction(...params);
      const asyncIterable = readStreamableValue(object);

      for await (const value of asyncIterable) {
        if (value !== undefined) {
          if ("partial" in value) {
            setPartialData(value.partial);
          } else {
            setStatus("success");
            setData(value.final);
            return value.final;
          }
        }
      }
    } catch (err) {
      console.error("Error while streaming data:");
      setStatus("error");
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(`An unknown error occurred: ${err}`));
      }
      return undefined;
    }
  };

  return {
    data,
    streamingData: partialData,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    mutate,
  };
}
