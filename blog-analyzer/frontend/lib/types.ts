import type { ContentAnalysis } from "@/baml_client"

export interface ExportedAnalysis {
  url: string
  title: string
  category: string
  analysis: ContentAnalysis | null
}

export interface SiteAnalysis {
  status: "not_started" | "started" | "finished"
  results: Record<string, ExportedAnalysis | null>
}
