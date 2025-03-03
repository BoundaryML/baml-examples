"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CircleDot, Code2, FileCode, Loader2, Play, RotateCcw, Type } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Define a type for BAML objects
interface BAML {
  interface_code: string
  return_type: string
}

interface GeneratedBAMLSectionProps {
  generatedBAML: BAML | null
  onExecute: (code: BAML) => Promise<void>
  isExecuting: boolean
}

export function GeneratedBAMLSection({
  generatedBAML: originalGeneratedBAML,
  onExecute,
  isExecuting,
}: GeneratedBAMLSectionProps) {
  // Local state for modifications
  const [generatedBAML, setGeneratedBAML] = useState<BAML>(
    originalGeneratedBAML || {
      interface_code: "",
      return_type: "",
    },
  )

  // Update local state when props change
  useEffect(() => {
    if (originalGeneratedBAML) {
      setGeneratedBAML(originalGeneratedBAML)
    }
  }, [originalGeneratedBAML])

  // Check if content has been modified
  const isInterfaceModified =
    originalGeneratedBAML && generatedBAML.interface_code !== originalGeneratedBAML.interface_code
  const isReturnTypeModified = originalGeneratedBAML && generatedBAML.return_type !== originalGeneratedBAML.return_type

  // Reset all changes to original values
  const resetAllChanges = () => {
    if (originalGeneratedBAML) {
      setGeneratedBAML({ ...originalGeneratedBAML })
    }
  }

  // Reset specific field to original value
  const resetField = (field: keyof BAML) => {
    if (originalGeneratedBAML) {
      setGeneratedBAML((prev) => ({
        ...prev,
        [field]: originalGeneratedBAML[field],
      }))
    }
  }

  // Update a specific field
  const updateField = (field: keyof BAML, value: string) => {
    setGeneratedBAML((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card className="border-slate-200 shadow-md overflow-hidden bg-slate-50">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center">
          <FileCode className="h-5 w-5 mr-2 text-slate-700" />
          <CardTitle>Generated BAML</CardTitle>
        </div>
        <CardDescription>Review and modify the generated BAML code before execution</CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {originalGeneratedBAML ? (
          <>
            <Tabs defaultValue="interface" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="interface" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  BAML Code
                  {isInterfaceModified && (
                    <CircleDot className="h-4 w-4 text-yellow-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="return-type" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Return Type
                  {isReturnTypeModified && (
                    <CircleDot className="h-4 w-4 text-yellow-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interface" className="space-y-4">
                <div className="relative">
                  <Textarea
                    className="font-mono bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto min-h-[300px] text-sm w-full border-slate-800 focus-visible:ring-slate-700"
                    value={generatedBAML.interface_code}
                    onChange={(e) => updateField("interface_code", e.target.value)}
                    spellCheck={false}
                  />
                  {isInterfaceModified && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-0 right-2 text-slate-400 hover:underline text-xs hover:bg-transparent hover:text-slate-200"
                      onClick={() => resetField("interface_code")}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Revert
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="return-type" className="space-y-4">
                <div className="relative">
                  <Input
                    className="font-mono bg-slate-950 text-slate-100 p-4 rounded-md overflow-auto text-sm w-full border-slate-800 focus-visible:ring-slate-700"
                    value={generatedBAML.return_type}
                    onChange={(e) => updateField("return_type", e.target.value)}
                    spellCheck={false}
                  />
                  {isReturnTypeModified && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-0 right-2 text-slate-400 hover:underline text-xs hover:bg-transparent hover:text-slate-200"
                      onClick={() => resetField("return_type")}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Revert
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {isInterfaceModified && isReturnTypeModified && (
              <div className="flex items-center justify-end mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-slate-600 border-slate-300 hover:bg-slate-100"
                  onClick={resetAllChanges}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset All Changes
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <FileCode className="h-12 w-12 text-slate-300" />
            <div className="text-center">
              <p className="text-slate-500 font-medium">No BAML code generated yet</p>
              <p className="text-sm text-slate-400 mt-1">Generate BAML code to see it here</p>
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="p-4 bg-slate-50">
        <Button
          onClick={() => onExecute(generatedBAML)}
          disabled={isExecuting || !originalGeneratedBAML}
          className={cn(
            "w-full transition-all duration-200",
            !isExecuting && originalGeneratedBAML ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-600",
          )}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing BAML...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute BAML
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

