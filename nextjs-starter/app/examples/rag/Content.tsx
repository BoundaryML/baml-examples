'use client'

import { StreamState } from "@/app/_hooks/useStream"
import { answerQuestion } from "@/app/actions/streamable_objects"
import { Answer, Citation, Document } from "@/baml_client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { documents } from "@/lib/rag-docs"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import clsx from "clsx"
import { AlertCircle, CheckCircle, CheckCircle2, Clock, Cog, Loader2, Rocket, XCircle } from "lucide-react"
import { getCitationContext, createWikipediaLink } from "./utils"
import examples from "./examples"
import Link from "next/link"
import { PropsWithChildren, useEffect, useState } from "react"
import ErrorPreview from "../stream-object/ErrorPreview"
import { RecursivePartialNull } from "@/baml_client/async_client"
import { motion } from "framer-motion"
import JsonView from "react18-json-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const Content: React.FC<{
  question: string
  setQuestion: (value: string) => void
  answerAction: StreamState<typeof answerQuestion>
}> = ({ question, setQuestion, answerAction }) => {
  return (
    <div className="px-4 md:px-12 flex flex-col items-center w-full py-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-4xl flex flex-col h-fit items-center gap-y-8">
        <h1 className="font-bold text-4xl text-gray-800 mb-2">RAG Example</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            isLoading={answerAction.isLoading}
            onClick={() => answerAction.mutate(question, { documents })}
          >
            <AnswerContent answerAction={answerAction} />
          </QuestionInput>
          <DebugPanel answerAction={answerAction} />
        </div>
      </div>
    </div>
  )
}

const QuestionInput: React.FC<
  PropsWithChildren<{
    question: string
    setQuestion: (value: string) => void
    isLoading: boolean
    onClick: () => void
  }>
> = ({ children, question, setQuestion, isLoading, onClick }) => {
  return (
    <Card className="col-span-1 bg-white shadow-lg rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl flex flex-row gap-2"><Rocket className="w-8 h-8" /> SpaceX Wiki</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 mb-6 text-sm text-gray-600">
          <span>
            Ask any question about this{" "}
            <Link
              className="text-blue-500 hover:underline font-medium"
              href={"https://en.wikipedia.org/wiki/SpaceX"}
            >
              SpaceX
            </Link>{" "}
            Wikipedia article to see how RAG works! Or choose a preset question:
          </span>
          <LoadPresetExample setQuestion={setQuestion} />
        </div>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here..."
          className="h-[100px] text-sm resize-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          disabled={isLoading}
        />
        <Button 
          onClick={onClick} 
          disabled={isLoading} 
          className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Answering...
            </>
          ) : (
            <>Submit</>
          )}
        </Button>
        {children}
      </CardContent>
    </Card>
  )
}

const LoadPresetExample: React.FC<{ setQuestion: (value: string) => void }> = ({
  setQuestion,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(examples).map(([name, entry]) => (
        <Button
          key={name}
          onClick={() => setQuestion(entry.value)}
          variant="outline"
          className="text-xs px-1 py-0 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
        >
          {entry.title}
        </Button>
      ))}
    </div>
  )
}

export const AnswerContent: React.FC<{
  answerAction: StreamState<typeof answerQuestion>
}> = ({ answerAction: { data, streamingData, status, error } }) => {
  if (status === "idle") return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mt-6 bg-muted shadow-lg rounded-xl overflow-hidden border-0">
        <CardContent className="p-6">
          {status === "error" && <RenderAnswer data={{
            answer: "Sorry, I couldn't find an answer to your question. Please try again.",
            answersInText: []
          }} />}
          {(status === "success" && data) ||
          (status === "loading" && streamingData) ? (
            <RenderAnswer data={data || streamingData!} />
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const RenderAnswer: React.FC<{ data: RecursivePartialNull<Answer> }> = ({
  data: { answer, answersInText },
}) => {
  if (!answersInText)
    return (
      <>
        <div className="min-h-[50px] text-gray-600">
          Looking for citations...
        </div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </>
    )

  if (!answer) {
    return (
      <>
        <div className="min-h-[50px] text-gray-600">
          Found{" "}
          {answersInText.length > 0 ? answersInText.length.toString() : ""}{" "}
          citations...
        </div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </>
    )
  }

  const parts = answer.split(/(\[\d+\])/)
  return (
    <div className="text-lg leading-relaxed text-gray-800">
      {parts.map((part, index) => {
        if (part.match(/^\[\d+\]$/)) {
          const citationNumber = part.slice(1, -1)
          const citation = answersInText.find(
            (c) => c?.number === parseInt(citationNumber)
          )

          if (!citation) return part
          const context = getCitationContext(citation as Citation, documents)

          return (
            <HoverCard key={index} openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <sup
                  className={clsx(
                    "cursor-pointer inline-block font-bold text-sm",
                    context
                      ? "text-blue-600 hover:underline"
                      : "text-orange-500"
                  )}
                >
                  [{citationNumber}]
                </sup>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                className="w-[300px] p-4 bg-white shadow-xl rounded-lg border border-gray-200"
              >
                {context ? (
                  <>
                    <h4 className="font-semibold mb-2 text-gray-800">
                      {context.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ...{context.before}
                      <span className="bg-yellow-100 px-1 rounded">{context.cited}</span>
                      {context.after}...
                    </p>
                    <a
                      href={createWikipediaLink(context.link, context.cited)}
                      className="text-blue-600 hover:underline mt-2 block text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wikipedia
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    No exact match found for this citation.
                  </p>
                )}
              </HoverCardContent>
            </HoverCard>
          )
        }
        return part
      })}
    </div>
  )
}

const DebugPanel: React.FC<{
  answerAction: StreamState<typeof answerQuestion>
}> = ({ answerAction }) => {
  const data = answerAction.isSuccess
    ? answerAction.data
    : answerAction.isLoading
    ? answerAction.streamingData
    : null


    const Status: React.FC<{ status: StreamState<any>["status"] }> = ({
        status,
      }) => {
        const statusConfig = {
          loading: { icon: Loader2, className: "animate-spin text-blue-500" },
          error: { icon: AlertCircle, className: "text-red-500" },
          success: { icon: CheckCircle, className: "text-green-500" },
          idle: { icon: null, className: "" },
        }
      
        const { icon: Icon, className } = statusConfig[status] || statusConfig.idle
      
        return Icon ? <Icon className={`h-5 w-5 ${className}`} /> : null
      }
      
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cog className="h-6 w-6 text-gray-300" />
              <span className="text-xl font-semibold">Debug Panel</span>
            </div>
            <Status status={answerAction.status} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {answerAction.status === "error" && answerAction.error && (
          <ErrorPreview error={answerAction.error} />
        )}
        <Tabs defaultValue="citations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-none">
            <TabsTrigger
              value="citations"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              Citations
            </TabsTrigger>
            <TabsTrigger 
              value="json" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              JSON View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="citations" className="p-4">
              {data && (
                <div className="text-xs text-gray-800">
                  Found {data.answersInText?.length ?? 0} citations.
                </div>
              )}

              {data?.answersInText?.map((citation, index) => citation && (
                  <ShowCitation key={index} citation={citation} />
              ))}
          </TabsContent>
          <TabsContent value="json" className="border-t p-4 bg-gray-50 text-xs">
              <JsonView
                src={data}
                theme="atom"
                collapseStringsAfterLength={50}
              />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

const ShowCitation: React.FC<{ citation: RecursivePartialNull<Citation> }> = ({
  citation,
}) => {
  const context =
    citation.documentTitle && citation.relevantTextFromDocument
      ? getCitationContext(
          {
            documentTitle: citation.documentTitle,
            relevantTextFromDocument: citation.relevantTextFromDocument,
          },
          documents
        )
      : null
  const isCitationFound = !!context

  return (
    <Card className="mb-4 last:mb-0 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-200">
      <CardHeader className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Citation [{citation.number}]
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger  asChild>
              <Badge 
                variant={isCitationFound ? "default" : "destructive"}
                className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
              >
                {isCitationFound ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {isCitationFound ? "Found" : "Not Found"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {isCitationFound
                ? "This citation was found in the source documents"
                : "This citation could not be found in the source documents"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
          {citation.relevantTextFromDocument}
        </div>
        {isCitationFound && context && (
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">{context.title}</p>
            <p className="mt-1 leading-relaxed">
              ...{context.before}
              <span className="bg-yellow-100 px-1 rounded">{context.cited}</span>
              {context.after}...
            </p>
            <a
              href={createWikipediaLink(context.link, context.cited)}
              className="text-blue-600 hover:underline mt-2 inline-block font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Wikipedia
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Content