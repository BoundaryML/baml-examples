"use client"

import { useState, useEffect } from "react"
import { AnalyzerForm } from "@/components/analyzer-form"
import { AnalysisResults } from "@/components/analysis-results"
import type { SiteAnalysis } from "@/lib/types"

export default function Home() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<SiteAnalysis | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Start polling when a URL is submitted
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (currentUrl && isPolling) {
      // Poll every 2 seconds
      intervalId = setInterval(async () => {
        try {
          const response = await fetch("/api/results", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: currentUrl }),
          })

          if (response.ok) {
            const data = await response.json()
            setAnalysisData(data)

            // Stop polling when analysis is finished
            if (data.status === "finished" || (data.results && data.results.length > 0)) {
              setIsPolling(false)
            }
          }
        } catch (error) {
          console.error("Error fetching results:", error)
        }
      }, 2000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [currentUrl, isPolling])

  const handleSubmit = async (url: string) => {
    setCurrentUrl(url)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        setIsPolling(true)
      }
    } catch (error) {
      console.error("Error starting analysis:", error)
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Website Analyzer</h1>

      <AnalyzerForm onSubmit={handleSubmit} />

      {currentUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Analysis for: {currentUrl}</h2>
          <AnalysisResults data={analysisData} isLoading={isPolling} />
        </div>
      )}
    </main>
  )
}
