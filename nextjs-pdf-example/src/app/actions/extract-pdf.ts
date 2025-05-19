'use server';
import { type Position, b } from '@/baml_client';
import { Image } from '@boundaryml/baml';
import { createStreamableValue } from 'ai/rsc';
/**
 * Strips the prefix from a base64 string.
 * @param {string} base64 - The base64 string with a prefix.
 * @returns {string} - The base64 string without the prefix.
 */
function stripBase64Prefix(base64: string): string {
  const prefixIndex = base64.indexOf(',');
  return prefixIndex !== -1 ? base64.substring(prefixIndex + 1) : base64;
}

// Start of Selection

export async function extractStatement(base64: string) {
  const objectStream = createStreamableValue<Partial<Position[]>, any>();
  const rawBase64 = stripBase64Prefix(base64);

  (async () => {
    const stream = b.stream.ExtractStatement(
      Image.fromBase64('image/png', rawBase64),
    );

    for await (const event of stream) {
      console.log(event);
      if (event) {
        objectStream.update(event as Partial<Position[]>);
      }
    }

    objectStream.done();
  })();

  return { object: objectStream.value };
}

export async function validateStatement(positions: string, base64: string) {
  const validatedPositions = await b.ValidateStatement(
    positions,
    Image.fromBase64('image/png', stripBase64Prefix(base64)),
  );
  return validatedPositions;
}
