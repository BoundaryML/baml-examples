import { b } from '@/baml_client'

function iteratorToStream(stream: any) {
  let finalResult: any;
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await stream[Symbol.asyncIterator]().next()
        if (done) {
          try {
            finalResult = await stream.getFinalResponse();
            console.log('Final result:', finalResult);
          } catch (error) {
            console.error('Error getting final response:', error);
          }
          controller.close()
        } else {
          // The new line makes the chunk actually get emitted to the stream
          controller.enqueue(JSON.stringify(value) + "\n")
        }
      } catch (error) {
        console.error('Error in stream:', error)
        controller.error(error)
      }
    },
  })
}

// Try to curl this with 
// curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/stream_text
export async function POST(req: Request) {
  try {
    const stream = b.stream.ExtractResume("Sarah Montez\nHarvard University\nMay 2015-2019\n3.92 GPA\nGoogle\nSoftware Engineer\nJune 2019-Present\n- Backend engineer\n- Rewrote search and uplifted metrics by 120%\n- Used C++ and Python\nMicrosoft\nSoftware Intern\nJune 2018-August 2018\n- Worked on the Windows team\n- Updated the UI\n- Used C++")

    const response = new Response(iteratorToStream(stream));

    return response;
  } catch (error) {
    console.error('Failed to create stream:', error)
    return new Response('Failed to process the request', { status: 500 })
  }
}