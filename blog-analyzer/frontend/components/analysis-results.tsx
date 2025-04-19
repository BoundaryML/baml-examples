"use client"

import type { SiteAnalysis } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, ExternalLink } from "lucide-react"

interface AnalysisResultsProps {
  data: SiteAnalysis | null
  isLoading: boolean
  url?: string
}

export function AnalysisResults({ data: rawData, isLoading, url }: AnalysisResultsProps) {
  if (!rawData && !isLoading) {
    return null
  }

  const data = Object.entries(rawData?.results || {}).sort(([_, a], [__, b]) => {
    if (!a && !b) {
      return 0
    }
    if (!a) {
      return 1
    }
    if (!b) {
      return -1
    }
    if (a.category === b.category) {
      return a.title.localeCompare(b.title)
    }
    // sort by category type
    return a.category.localeCompare(b.category);
  })

  return (
    <div className="space-y-4">
      {url && (
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">
            Analysis for: <span className="font-mono text-lg">{url}</span>
          </h2>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">Analysis Results</CardTitle>
          <StatusBadge status={rawData?.status || "not_started"} isLoading={isLoading} />
        </CardHeader>
        <CardContent>
          {isLoading && !rawData && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Title</th>
                    <th className="p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Type</th>
                    <th className="p-3 text-sm font-medium text-slate-600 dark:text-slate-400">Results</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(([key, result]) =>
                    result ? (
                      <tr key={result.url} className="border-b last:border-0">
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-1">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                            >
                              {result.title || "Untitled"}
                              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{result.url}</span>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <TypeBadge type={result.category} />
                        </td>
                        <td className="p-3 align-top">
                          {result.analysis ? (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Value Ratio:</span>
                                  <ValueRatioBadge value={result.analysis.valueRatio} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Primary Intent:</span>
                                  <IntentBadge intent={result.analysis.primaryIntent} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Educational Depth:</span>
                                  <DepthBadge depth={result.analysis.educationalDepth} />
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 font-medium">Key Insights:</h4>
                                <ul className="ml-5 list-disc space-y-1">
                                  {result.analysis.keyInsights.map((insight, index) => (
                                    <li key={index} className="text-sm">
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="mb-2 font-medium">Technical Questions Answered:</h4>
                                <ul className="ml-5 list-disc space-y-2">
                                  {result.analysis.technicalQuestionsAnswered.map((question, index) => (
                                    <li key={index} className="text-sm">
                                      <span>{question.question}</span>
                                      <span> - </span>
                                      <DepthIndicator depth={question.depth} />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <p className="italic text-slate-500 dark:text-slate-400">No analysis data available</p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr key={key} className="border-b last:border-0">
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-1">
                            <a
                              href={key}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                            >
                              {"Pending..."}
                              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{key}</span>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <TypeBadge type={"loading"} />
                        </td>
                        <td className="p-3 align-top">
                          ...
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({
  status,
  isLoading,
}: {
  status: string
  isLoading: boolean
}) {
  if (isLoading && (status === "not_started" || status === "started")) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      >
        <Clock className="h-3 w-3 animate-pulse" />
        <span>Analyzing...</span>
      </Badge>
    )
  }

  switch (status) {
    case "finished":
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Completed</span>
        </Badge>
      )
    case "started":
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        >
          <Clock className="h-3 w-3" />
          <span>In Progress</span>
        </Badge>
      )
    default:
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          <span>Not Started</span>
        </Badge>
      )
  }
}

function TypeBadge({ type }: { type: string }) {
  const bgColor =
    type === "blog_post"
      ? "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
      : type === "article"
        ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
        : type === "loading"
          ? "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
          : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"

  return (
    <Badge variant="outline" className={`${bgColor} font-medium`}>
      {type}
    </Badge>
  )
}

function ValueRatioBadge({ value }: { value: string }) {
  const bgColor =
    value === "mostly-educational"
      ? "bg-teal-900 text-white"
      : value === "balanced"
        ? "bg-amber-600 text-white"
        : "bg-red-600 text-white"

  return <Badge className={`${bgColor} font-medium`}>{value}</Badge>
}

function IntentBadge({ intent }: { intent: string }) {
  const bgColor = intent === "educational" ? "bg-teal-900 text-white" : "bg-red-600 text-white"

  return <Badge className={`${bgColor} font-medium`}>{intent}</Badge>
}

function DepthBadge({ depth }: { depth: string }) {
  const bgColor =
    depth === "deep"
      ? "bg-teal-900 text-white"
      : depth === "intermediate"
        ? "bg-amber-600 text-white"
        : "bg-slate-600 text-white"

  return <Badge className={`${bgColor} font-medium`}>{depth}</Badge>
}

function DepthIndicator({ depth }: { depth: string }) {
  const textColor =
    depth === "deep_technical" ? "text-teal-700 dark:text-teal-500 font-medium" : "text-slate-600 dark:text-slate-400"

  return <span className={textColor}>{depth.replace("_", " ")}</span>
}
