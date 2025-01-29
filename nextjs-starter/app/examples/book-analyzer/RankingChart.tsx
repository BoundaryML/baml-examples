"use client"

import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RankingItem {
  bookName?: string | null
  score?: number | null
}

interface RankingChartProps {
  rankingData: (RankingItem | undefined)[] | null | undefined
  bookColors: Record<string, string>
}

export function RankingChart({ rankingData, bookColors }: RankingChartProps) {
  const chartData = rankingData
    ?.filter((item) => item?.bookName && bookColors[item.bookName])
    .map((item) => ({
      name: item?.bookName ?? "",
      value: item?.score ?? 0,
      color: bookColors[item?.bookName ?? ""],
    }))

  const chartConfig = Object.fromEntries(
    Object.entries(bookColors).map(([bookName, color]) => [
      bookName,
      { label: bookName, color },
    ])
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
              >
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--foreground)' }}
                  tickLine={{ stroke: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--foreground)' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
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
                <Bar dataKey="value">
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