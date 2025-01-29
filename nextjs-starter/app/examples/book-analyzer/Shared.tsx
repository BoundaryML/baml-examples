"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Cog } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { PopularityLineChart } from "./Charts"
import { HexColorPicker } from "react-colorful"
import { RankingChart } from "./RankingChart"
import { WordCountChart } from "./WordCount"
import examples from "./examples"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import JsonView from 'react18-json-view'
import ErrorPreview from "../_components/ErrorPreview"
import type { HookResult } from "@/baml_client/react/types"
import type { AnalyzeBooksAction } from "@/baml_client/react/server"
import type { PopularityOverTime } from "@/baml_client/types"

export const Content: React.FC<{
  query: string
  setQuery: (value: string) => void
  answer: HookResult<typeof AnalyzeBooksAction>
}> = ({ query, setQuery, answer }) => {
  const [bookColors, setBookColors] = useState<Record<string, string>>({})
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null)
  const data = useMemo(() => answer.isSuccess ? answer.data : answer.isPending? answer.partialData: undefined, [answer])
  const books = useMemo(() => data?.bookNames?.filter((book): book is string => !!book) ?? [], [data])

  const handleAnalyze = (text: string) => {
    answer.mutate(text)
  }

  useEffect(() => {
    const newBookColors: Record<string, string> = {}
    books.forEach((book, index) => {
      if (!bookColors[book]) {
        newBookColors[book] = `hsl(${(index * 360) / books.length}, 70%, 50%)`
      }
    })
    setBookColors(prev => ({ ...prev, ...newBookColors }))
  }, [books])

  const handleColorChange = (color: string, book: string) => {
    setBookColors(prev => ({ ...prev, [book]: color }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
          Book Popularity Analyzer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Analyze Your Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Try one of these examples:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {examples.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(example.query)
                            handleAnalyze(example.query)
                          }}
                          className="text-xs"
                        >
                          {example.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter book titles, separated by commas..."
                    className="text-sm focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                  />
                  <Button
                    onClick={() => handleAnalyze(query)}
                    disabled={answer.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    {answer.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Analyze Books"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {answer.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-red-500 text-sm">
                    Sorry! Something went wrong. Please try again.
                  </p>
                </motion.div>
              )}
              {data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="mb-8 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl">Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500">Click to change colors (even while streaming)!</p>
                        <div className="flex flex-wrap gap-2">
                          {books.map((book, index) => (
                            <div key={index} className="relative">
                              <button
                                className="text-blue-900 dark:text-blue-100 p-2 rounded-md flex items-center gap-2 hover:bg-blue-100 transition-colors"
                                onClick={() => setActiveColorPicker(activeColorPicker === book ? null : book)}
                              >
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: bookColors[book] }}
                                />
                                {book}
                              </button>
                              {activeColorPicker === book && (
                                <div className="absolute z-10 mt-2">
                                  <HexColorPicker
                                    color={bookColors[book]}
                                    onChange={(color) => handleColorChange(color, book)}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                        <div className="space-y-8">
                            <PopularityLineChart
                              popularityData={data?.popularityOverTime}
                              bookColors={bookColors}
                            />
                            <RankingChart
                              rankingData={data.popularityRankings}
                              bookColors={bookColors}
                            />
                            <WordCountChart
                              wordCountData={data.wordCounts}
                              bookColors={bookColors}
                            />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <DebugPanel answer={answer} />
          </div>
        </div>
      </div>
    </div>
  )
}

const DebugPanel: React.FC<{
  answer: HookResult<typeof AnalyzeBooksAction>
}> = ({ answer }) => {
  const data = answer.isSuccess
    ? answer.data
    : answer.isPending
    ? answer.partialData
    : undefined

  const Status: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      idle: { color: "bg-gray-500", text: "Idle" },
      pending: { color: "bg-blue-500", text: "Loading" },
      success: { color: "bg-green-500", text: "Success" },
      error: { color: "bg-red-500", text: "Error" },
    }
    const { color, text } = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle

    return (
      <Badge variant="outline" className={`${color} text-white`}>
        {text}
      </Badge>
    )
  }

  return (
    <Card className="w-full shadow-lg sticky top-4">
      <CardHeader className="bg-gray-100 border-b">
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cog className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-semibold">Debug Panel</span>
            </div>
            <Status status={answer.status} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {answer.error && <ErrorPreview error={answer.error} />}
        <ScrollArea className="h-[600px] text-xs bg-muted">
              <JsonView
                src={data}
                theme="atom"
                collapseStringsAfterLength={50}
              />
            </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default Content