"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type AnyObject = Record<string, unknown> | unknown[] | string | number | boolean | null;

interface ExecutionResultSectionProps {
  executionResult: AnyObject;
}

export function ExecutionResultSection({ executionResult }: ExecutionResultSectionProps) {
  if (!executionResult) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Execution Result</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
          {JSON.stringify(executionResult, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}

