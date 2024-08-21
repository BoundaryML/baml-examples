"use server";
import { createStreamableValue } from "ai/rsc";
import { b } from "@/baml_client";
import { BamlCtxManager, BamlStream, Image } from "@boundaryml/baml";
import { BamlRuntime } from "@boundaryml/baml";

/**
 * Strips the prefix from a base64 string and returns the media type and data.
 * @param {string} base64 - The base64 string with a prefix.
 * @returns {{ mediaType: string, data: string }} - An object containing the media type and base64 data.
 *
 * data:image/jpeg;base64,{base64_image}
 */
function parseBase64Prefix(base64: string): {
  mediaType: string;
  data: string;
} {
  const [prefix, data] = base64.split(",", 2);
  const mediaType = prefix.split(":")[1].split(";")[0];
  return { mediaType, data };
}

// Start of Selection

export async function pdfGenerateBamlSchema(base64: string) {
  const objectStream = createStreamableValue<Partial<string>, any>(
    "starting.."
  );
  const { mediaType, data: rawBase64 } = parseBase64Prefix(base64);
  // console.log("rawBase64", rawBase64.substring(0, 100));
  (async () => {
    try {
      const stream = b.stream.PDFGenerateBAMLSchema([
        Image.fromBase64(mediaType, rawBase64),
      ]);

      for await (const event of stream) {
        if (event) {
          objectStream.update(event as Partial<string>);
        }
      }
      const response = await stream.getFinalResponse();
      objectStream.update(response as Partial<string>);
      objectStream.done();
    } catch (err) {
      const errorMsg = (err as Error).message.substring(0, 1000) + "...";
      console.log("error", (err as Error).message.substring(0, 1000) + "...");
      objectStream.error(errorMsg);
    }
  })();

  return { object: objectStream.value };
}

// Some stuff we gotta do to execute baml functions declared from a baml file at runtime
export async function extractWithSchema(base64: string, baml_schema: string) {
  const objectStream = createStreamableValue<Partial<string>, any>(
    "starting.."
  );

  const runtime = BamlRuntime.fromFiles(
    "baml_src",
    {
      "main.baml": baml_schema,
    },
    {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    }
  );

  const context = new BamlCtxManager(runtime);
  const { mediaType, data: rawBase64 } = parseBase64Prefix(base64);

  const rawStream = runtime.streamFunction(
    "Extract",
    {
      pdf: Image.fromBase64(mediaType, rawBase64),
    },
    () => {},
    context.cloneContext()
  );

  const stream = new BamlStream<any, any>(
    rawStream,
    (data: any) => {
      return data;
    },
    (data: any) => {
      return data;
    },
    context.cloneContext()
  );

  (async () => {
    try {
      for await (const event of stream) {
        console.log("eventtt" + event);
        if (event) {
          objectStream.update(event as Partial<string>);
        }
      }
      const response = await stream.getFinalResponse();
      objectStream.update(response as Partial<string>);
      objectStream.done();
    } catch (err) {
      objectStream.error(err as Error);
    }
  })();

  return { object: objectStream.value };
}
