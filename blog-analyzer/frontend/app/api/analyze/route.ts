import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Forward the request to your FastAPI backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: body.url }),
    })

    const data = await response.json()
    const nextResponse = NextResponse.json(data)

    // Set cache control headers to disable caching
    nextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    nextResponse.headers.set('Pragma', 'no-cache')
    nextResponse.headers.set('Expires', '0')
    nextResponse.headers.set('Surrogate-Control', 'no-store')

    return nextResponse
  } catch (error) {
    console.error("Error in analyze API route:", error)
    return NextResponse.json({ error: "Failed to start analysis" }, { status: 500 })
  }
}
