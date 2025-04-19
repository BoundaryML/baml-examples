"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

interface AnalyzerFormProps {
  onSubmit: (url: string) => void
}

export function AnalyzerForm({ onSubmit }: AnalyzerFormProps) {
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) return

    setIsSubmitting(true)

    // Basic URL validation
    let formattedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = `https://${url}`
    }

    onSubmit(formattedUrl)
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze a Website</CardTitle>
        <CardDescription>Enter a URL to analyze its content and structure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !url}>
            {isSubmitting ? "Submitting..." : "Analyze"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
