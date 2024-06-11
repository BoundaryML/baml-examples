import { StreamingTextResponse } from 'ai'
import { b } from '@/baml_client'

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next() 
      if (done) {
        controller.close()
      } else {
        // The new line makes the chunk actually get emitted to the stream
        controller.enqueue(JSON.stringify(value) + "\n")
      }
    },
  })
}

// Try to curl this with 
// curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/stream_text
export async function POST(req: Request) {
  const stream = b.stream.ExtractResume("Sarah Montez\nHarvard University\nMay 2015-2019\n3.92 GPA\nGoogle\nSoftware Engineer\nJune 2019-Present\n- Backend engineer\n- Rewrote search and uplifted metrics by 120%\n- Used C++ and Python\nMicrosoft\nSoftware Intern\nJune 2018-August 2018\n- Worked on the Windows team\n- Updated the UI\n- Used C++")


 
  return new Response(iteratorToStream(stream[Symbol.asyncIterator]()));
}