import { b } from "./baml_client";
import type { Resume } from "./baml_client/types";

async function Example(raw_resume: string): Promise<Resume> {
  // BAML's internal parser guarantees ExtractResume
  // to be always return a Resume type
  const response = await b.ExtractResume(raw_resume);
  return response;
}

async function ExampleStream(raw_resume: string): Promise<Resume> {
  const stream = b.stream.ExtractResume(raw_resume);
  for await (const msg of stream) {
    console.log(msg); // This will be a Partial<Resume> type
  }

  // This is guaranteed to be a Resume type.
  return await stream.getFinalResponse();
}

async function processFakeCV() {
  const fakeCV = `
  Name: John Doe
  123 Main St, Anytown, USA
  Email: john.doe@email.com
  Phone: (555) 123-4567
  
  Education:
  Bachelor of Science in Computer Science
  University of Technology, 2015-2019
  
  Work Experience:
  Software Engineer, Tech Corp
  June 2019 - Present
  - Developed and maintained web applications
  - Collaborated with cross-functional teams
  
  Skills:
  JavaScript, TypeScript, React, Node.js, Git
  `;

  try {
    const result = await Example(fakeCV);
    // Note: uncomment here for using streaming in the response
    // const result = await ExampleStream(fakeCV);
    console.log("Processed Resume:", result);
  } catch (error) {
    console.error("Error processing resume:", error);
  }
}

// Call the function
processFakeCV();
