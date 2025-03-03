"use client"

import { useState } from "react"
import { InputSection } from "@/components/input-section"
import { GeneratedBAMLSection } from "@/components/generated-baml-section"
import { type AnyObject, ExecutionResultSection } from "@/components/execution-result-section"
import { ErrorMessage } from "@/components/error-message"

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [generatedBAML, setGeneratedBAML] = useState<{
    interface_code: string
    return_type: string
  } | null>(null)
  const [executionResult, setExecutionResult] = useState<AnyObject | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentInput, setCurrentInput] = useState<{
    type: "text" | "file"
    text: string
    file: File | null
  }>({
    type: "text",
    text: "",
    file: null,
  })

  const handleGenerate = async (inputType: "text" | "file", textInput: string, file: File | null) => {
    setError(null)
    setIsGenerating(true)
    setCurrentInput({ type: inputType, text: textInput, file })

    try {
      const formData = new FormData()

      if (inputType === "text") {
        formData.append("content", textInput)
      } else if (file) {
        formData.append("file", file)
      } else {
        throw new Error("Please provide text or upload a file")
      }

      const response = await fetch("http://localhost:8000/generate_baml/call", {
        method: "POST",
        body: formData,
      })

      console.log(response)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      console.log("Response ok")
      const data = await response.json()
      console.log(data)
      setGeneratedBAML({
        interface_code: data.interface_code,
        return_type: data.return_type,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate BAML")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExecute = async (baml: typeof generatedBAML) => {
    if (!baml) {
      setError("Please generate BAML first")
      return
    }

    setError(null)
    setIsExecuting(true)

    try {
      const formData = new FormData()

      if (currentInput.type === "text") {
        formData.append("content", currentInput.text)
      } else if (currentInput.file) {
        formData.append("file", currentInput.file)
      } else {
        throw new Error("Please provide text or upload a file")
      }

      formData.append("baml_code", baml.interface_code)
      formData.append("return_type", baml.return_type)

      const response = await fetch("http://localhost:8000/execute_baml/call", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()
      setExecutionResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute BAML")
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">BAML Code Generator and Executor</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <InputSection onGenerate={handleGenerate} isGenerating={isGenerating} />

        <GeneratedBAMLSection generatedBAML={generatedBAML} onExecute={handleExecute} isExecuting={isExecuting} />
      </div>

      <ExecutionResultSection executionResult={executionResult} />
      <ErrorMessage error={error} />
    </main>
  )
}

