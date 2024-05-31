'use server';
import { createStreamableValue } from 'ai/rsc';
import { b, Resume } from '@/baml_client';
export async function extractResume(resumeText: string) {
  // Note, we will expose these partial types soon
  const resumeStream = createStreamableValue<Partial<Resume>, any>();

  (async () => {
    const stream = b.stream.ExtractResume(resumeText);

    for await (const event of stream) {
      console.log(event)
      if (event) {
        resumeStream.update(event)
      }
    }

    resumeStream.done();
  })()

  return { object: resumeStream.value}
}