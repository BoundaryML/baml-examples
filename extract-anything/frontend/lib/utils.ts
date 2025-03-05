import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fetches an SSE stream from the given URL using the provided FormData.
 *
 * @param {string} url - The URL to post the form data to.
 * @param {FormData} formData - The form data to send in the request.
 * @param {Function} onPartial - Callback invoked with each partial event data.
 * @returns {Promise<any>} Resolves with the final event data.
 */
export async function fetchSSE<PartialType, FinalType>(url: string, formData: FormData, onPartial: (partial: PartialType) => void): Promise<FinalType> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader");
  }
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;

  // Read and process the stream.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");

    // Process complete chunks (the last chunk may be incomplete).
    for (const part of parts.slice(0, -1)) {
      if (part.trim()) {
        console.log(part)
        try {
          const eventData = JSON.parse(part);

          if (eventData.partial) {
            console.log(eventData.partial)
            // Call the partial update callback.
            onPartial(eventData.partial);
          } else if (eventData.final) {
            finalResult = eventData.final;
            // Optionally, process the final event immediately.
            break;
          } else if (eventData.error) {
            throw new Error(eventData.error);
          }
        } catch (err) {
          console.error("Error parsing event chunk:", err);
        }
      }
    }

    // If we've received the final event, exit the loop.
    if (finalResult) {
      break;
    }

    // Keep the incomplete part for the next read.
    buffer = parts[parts.length - 1];
  }
  return finalResult as FinalType;
}
