import { b } from "../baml_client"

export async function extractResume() {

  const resume = await b.ExtractResume(`
    John Doe
    johndoe@gmail.com
    (555) 555-5555
    Software Engineer
    Software Engineer with 5 years of experience in software development.
    Bachelor's degree in Computer Science from MIT.
    Master's degree in Software Engineering from Stanford.
    Experience with React, Node.js, and MongoDB.

    `)
  console.log(resume)

  return resume
}