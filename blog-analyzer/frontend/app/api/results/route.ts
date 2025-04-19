import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Forward the request to your FastAPI backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/results?url=${body.url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Add the URL as a query parameter
    const url = new URL(response.url)
    url.searchParams.append("url", body.url)

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in results API route:", error)
    return NextResponse.json({ error: "Failed to fetch analysis results" }, { status: 500 })
  }
}
