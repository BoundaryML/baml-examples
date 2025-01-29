"use client"

import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface WordCountItem {
  bookName?: string | null
  count?: number | null
}

interface WordCountChartProps {
  wordCountData: (WordCountItem | undefined)[] | null | undefined
  bookColors: Record<string, string>
}

export function WordCountChart({ wordCountData, bookColors }: WordCountChartProps) {
  const chartData = wordCountData
    ?.filter((item) => item?.bookName && bookColors[item.bookName])
    .map((item) => ({
      name: item?.bookName ?? "",
      "Word Count": item?.count ?? 0,
      color: bookColors[item?.bookName ?? ""],
    }))

  const chartConfig = Object.fromEntries(
    Object.entries(bookColors).map(([bookName, color]) => [
      bookName,
      { label: bookName, color },
    ])
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Word Count</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--foreground)' }}
                  tickLine={{ stroke: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--foreground)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--foreground)' }}
                  tickLine={{ stroke: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--foreground)' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                    />
                  }
                />
                <Bar dataKey="Word Count">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}