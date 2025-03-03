"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Code } from "lucide-react"

interface InputSectionProps {
  onGenerate: (inputType: "text" | "file", textInput: string, file: File | null) => Promise<void>
  isGenerating: boolean
}

export function InputSection({ onGenerate, isGenerating }: InputSectionProps) {
  const [inputType, setInputType] = useState<"text" | "file">("text")
  const [textInput, setTextInput] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleGenerate = () => {
    onGenerate(inputType, textInput, file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input</CardTitle>
        <CardDescription>Upload an image or enter text to generate BAML code</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" onValueChange={(value) => setInputType(value as "text" | "file")}>
          <TabsList className="mb-4">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Textarea
              placeholder="Enter your text here..."
              className="min-h-[200px] max-h-[400px]"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="file">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <p>{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  <Button variant="outline" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <Input type="file" className="mt-4" onChange={handleFileChange} />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (inputType === "text" && !textInput) || (inputType === "file" && !file)}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" />
              Generate BAML
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

