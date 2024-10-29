"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
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
    <Card className="w-fit h-full min-h-96">
      <CardHeader>
        <CardTitle>Word Count</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && (
          <ChartContainer config={chartConfig}>
            <BarChart 
              data={chartData} 
              width={400}
              height={350}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--foreground)' }}
                axisLine={{ stroke: 'var(--foreground)' }}
                // angle={-45}
                // textAnchor="end"
                height={100}
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
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}