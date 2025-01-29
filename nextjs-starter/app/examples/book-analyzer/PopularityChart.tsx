"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

interface PopularityLineChartProps {
  popularityData: { date: number; [key: string]: number }[]
  bookColors: Record<string, string>
}

export function PopularityLineChart({ popularityData, bookColors }: PopularityLineChartProps) {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null)

  // Create a memoized config object that updates when popularityData changes
  const chartConfig = useMemo(() => {
    return Object.keys(bookColors).reduce((acc, book) => ({
      ...acc,
      [book]: {
        label: book,
        color: bookColors[book],
      },
    }), {})
  }, [bookColors, popularityData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Popularity Over Time</CardTitle>
      </CardHeader>
      <CardContent >
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer>
            <LineChart data={popularityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                type="number"
                tick={{ fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--foreground)' }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tick={{ fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--foreground)' }}
                label={{ value: 'Popularity', angle: -90, position: 'insideLeft', fill: 'var(--foreground)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {Object.keys(bookColors).map((book) => (
                <Line
                  key={book}
                  type="monotone"
                  dataKey={book}
                  stroke={bookColors[book]}
                  strokeWidth={hoveredBook === book ? 3 : 1.5}
                  dot={false}
                  connectNulls={true}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}