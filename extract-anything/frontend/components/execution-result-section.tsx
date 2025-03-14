"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"

export type AnyObject = Record<string, unknown> | unknown[] | string | number | boolean | null

interface ExecutionResultSectionProps {
  executionResult: AnyObject
}

export function ExecutionResultSection({ executionResult }: ExecutionResultSectionProps) {
  const [activeTab, setActiveTab] = useState("table")

  if (!executionResult) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Execution Result</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="pretty">Pretty</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="mt-0">
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs font-mono">
              <JsonSyntaxHighlight json={executionResult} />
            </pre>
          </TabsContent>

          <TabsContent value="yaml" className="mt-0">
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs font-mono">
              {formatAsYaml(executionResult)}
            </pre>
          </TabsContent>

          <TabsContent value="pretty" className="mt-0">
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-sm">
              <PrettyPrint data={executionResult} />
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
              <TableView data={executionResult} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// JSON Syntax Highlighting
function JsonSyntaxHighlight({ json }: { json: AnyObject }) {
  const jsonString = JSON.stringify(json, null, 2)

  // Simple syntax highlighting
  const highlighted = jsonString
    .replace(/"([^"]+)":/g, '<span class="text-purple-500">"$1"</span>:') // keys
    .replace(/:(\s*)"([^"]+)"/g, ':$1<span class="text-green-500">"$2"</span>') // string values
    .replace(/:(\s*)(true|false)/g, ':$1<span class="text-amber-500">$2</span>') // booleans
    .replace(/:(\s*)(null)/g, ':$1<span class="text-gray-500">$2</span>') // null
    .replace(/:(\s*)(\d+)/g, ':$1<span class="text-blue-500">$2</span>') // numbers

  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
}

// YAML formatter
function formatAsYaml(data: AnyObject): string {
  if (data === null) return "null"
  if (typeof data === "undefined") return "undefined"

  const formatValue = (value: AnyObject, indent = 0): string => {
    const spaces = " ".repeat(indent)

    if (value === null || value === undefined) {
      return "null"
    }

    if (typeof value === "string") {
      // Check if string needs quotes (contains special chars)
      if (/[:#{}[\],&*?|<>=!%@`]/.test(value) || value === "" || !Number.isNaN(Number(value))) {
        return `"${value.replace(/"/g, '\\"')}"`
      }
      return value
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value)
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return "[]"

      return value.map((item) => `${spaces}- ${formatValue(item as AnyObject, indent + 2).trimStart()}`).join("\n")
    }

    if (typeof value === "object") {
      if (Object.keys(value).length === 0) return "{}"

      return Object.entries(value)
        .map(([key, val]) => {
          const formattedVal = formatValue(val as AnyObject, indent + 2)
          // If the formatted value is multiline, add a newline after the key
          if (formattedVal.includes("\n")) {
            return `${spaces}${key}:\n${" ".repeat(indent + 2)}${formattedVal.trimStart()}`
          }
          return `${spaces}${key}: ${formattedVal}`
        })
        .join("\n")
    }

    return String(value)
  }

  return formatValue(data)
}

// Pretty Print component for hierarchical view
function PrettyPrint({ data, level = 0 }: { data: AnyObject; level?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (data === null) {
    return <span className="text-gray-500 italic">null</span>
  }

  if (typeof data === "undefined") {
    return <span className="text-gray-500 italic">undefined</span>
  }

  if (typeof data === "string") {
    return <span className="text-emerald-600">&quot;{data}&quot;</span>
  }

  if (typeof data === "number") {
    return <span className="text-blue-600">{data}</span>
  }

  if (typeof data === "boolean") {
    return <span className="text-amber-600 font-semibold">{String(data)}</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500">[]</span>
    }

    return (
      <div className="ml-4">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className="flex items-center cursor-pointer hover:bg-secondary/50 rounded px-1"
          onClick={() => toggleExpand(`array-${level}`)}
        >
          {expanded[`array-${level}`] ? (
            <ChevronDown className="h-4 w-4 text-blue-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-blue-700 font-medium">Array[{data.length}]</span>
        </div>

        {expanded[`array-${level}`] && (
          <div className="ml-4 border-l-2 border-blue-200 pl-2">
            {data.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={index} className="flex py-0.5">
                <span className="text-blue-500 mr-2 font-mono">{index}:</span>
                <PrettyPrint data={item as AnyObject} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (typeof data === "object") {
    const keys = Object.keys(data)

    if (keys.length === 0) {
      return <span className="text-gray-500">{"{}"}</span>
    }

    return (
      <div className="ml-4">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className="flex items-center cursor-pointer hover:bg-secondary/50 rounded px-1"
          onClick={() => toggleExpand(`object-${level}`)}
        >
          {expanded[`object-${level}`] ? (
            <ChevronDown className="h-4 w-4 text-purple-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-purple-500" />
          )}
          <span className="text-purple-700 font-medium">Object{`{${keys.length}}`}</span>
        </div>

        {expanded[`object-${level}`] && (
          <div className="ml-4 border-l-2 border-purple-200 pl-2">
            {keys.map((key) => (
              <div key={key} className="flex py-0.5">
                <span className="text-purple-600 font-medium mr-2">{key}:</span>
                <PrettyPrint data={data[key] as AnyObject} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <span>{String(data)}</span>
}

// Table View component
function TableView({ data }: { data: AnyObject }) {
  // Handle primitive types
  if (
    data === null ||
    typeof data === "undefined" ||
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean"
  ) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Value</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{formatCellValue(data)}</TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-xs">
                {data === null ? "null" : typeof data}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <div className="text-gray-500">Empty array</div>
    }

    // Check if array contains objects with consistent keys (table-friendly)
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      // Get all unique keys from all objects in the array
      const allKeys = new Set<string>()
      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          for (const key of Object.keys(item)) {
            allKeys.add(key)
          }
        }
      }

      const keys = Array.from(allKeys)

      if (keys.length > 0) {
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 bg-muted/50 z-10">#</TableHead>
                  {keys.map((key) => (
                    <TableHead key={key} className={key === "status" ? "min-w-[100px]" : ""}>
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <TableRow key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                    <TableCell className="sticky left-0 bg-muted/20 z-10 font-mono text-xs">{index}</TableCell>
                    {keys.map((key) => (
                      <TableCell key={key} className="min-w-[120px]">
                        {typeof item === "object" && item !== null && key in item ? (
                          formatCellValue((item as Record<string, unknown>)[key] as AnyObject, key)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      }
    }

    // Fallback for arrays with mixed content
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Index</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TableRow key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
              <TableCell className="font-mono text-xs">{index}</TableCell>
              <TableCell className="min-w-[300px]">{formatCellValue(item as AnyObject)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {item === null ? "null" : typeof item}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Handle objects
  if (typeof data === "object") {
    const keys = Object.keys(data)

    if (keys.length === 0) {
      return <div className="text-gray-500">Empty object</div>
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key, index) => (
            <TableRow key={key} className={index % 2 === 0 ? "bg-muted/20" : ""}>
              <TableCell className="font-medium text-purple-700">{key}</TableCell>
              <TableCell className="min-w-[300px]">
                {key === "status" ? (
                  <Badge>{String(data[key])}</Badge>
                ) : key === "activity_status" && data[key] ? (
                  <Badge variant="outline">{String(data[key])}</Badge>
                ) : (
                  formatCellValue(data[key] as AnyObject, key)
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {data[key] === null ? "null" : typeof data[key]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return <div>Unable to display data in table format</div>
}

// Update the formatCellValue function to better handle arrays and add colors
function formatCellValue(value: AnyObject, key?: string): React.ReactNode {
  if (value === null) {
    return <span className="text-gray-500 italic">null</span>
  }

  if (value === undefined) {
    return <span className="text-gray-500 italic">undefined</span>
  }

  if (typeof value === "string") {
    // Special handling for dates or timestamps
    if (key === "created_at" || key?.includes("date") || key?.includes("time")) {
      return <span className="text-indigo-600">{value}</span>
    }
    return value.length > 50 ? (
      <span className="text-emerald-700">{`${value.substring(0, 50)}...`}</span>
    ) : (
      <span className="text-emerald-700">{value}</span>
    )
  }

  if (typeof value === "number") {
    return <span className="text-blue-600 font-medium">{value}</span>
  }

  if (typeof value === "boolean") {
    return <span className="text-amber-600 font-semibold">{String(value)}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">[]</span>
    }

    // For small arrays with simple values, display them inline
    if (
      value.length <= 3 &&
      value.every(
        (item) => item === null || typeof item === "string" || typeof item === "number" || typeof item === "boolean",
      )
    ) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100">
              {item === null ? "null" : String(item)}
            </Badge>
          ))}
        </div>
      )
    }

    // For larger or complex arrays
    return (
      <details className="cursor-pointer group">
        <summary className="text-sm text-blue-600 font-medium hover:text-blue-800 list-none flex items-center">
          <ChevronRight className="h-3 w-3 inline mr-1 group-open:rotate-90 transition-transform" />
          Array[{value.length}]
        </summary>
        <div className="pl-2 mt-1 border-l-2 border-blue-200">
          {value.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i} className="flex items-start gap-2 text-xs py-0.5">
              <span className="text-blue-500 font-mono">{i}:</span>
              {formatCellValue(item as AnyObject)}
            </div>
          ))}
        </div>
      </details>
    )
  }

  if (typeof value === "object") {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return <span className="text-gray-400 italic">{"{}"}</span>
    }

    return (
      <details className="cursor-pointer group">
        <summary className="text-sm text-purple-600 font-medium hover:text-purple-800 list-none flex items-center">
          <ChevronRight className="h-3 w-3 inline mr-1 group-open:rotate-90 transition-transform" />
          Object{`{${keys.length}}`}
        </summary>
        <div className="pl-2 mt-1 border-l-2 border-purple-200">
          {keys.map((key) => (
            <div key={key} className="flex items-start gap-2 text-xs py-0.5">
              <span className="text-purple-600 font-medium">{key}:</span>
              {formatCellValue(value[key] as AnyObject, key)}
            </div>
          ))}
        </div>
      </details>
    )
  }

  return String(value)
}

