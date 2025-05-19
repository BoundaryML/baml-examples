'use client';

import type { partial_types } from '@/baml_client/partial_types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';

interface RankingChartProps {
  rankingData:
    | partial_types.BookAnalysis['popularityRankings']
    | null
    | undefined;
  bookColors: Record<string, string>;
}

export function RankingChart({ rankingData, bookColors }: RankingChartProps) {
  const chartData = rankingData
    ?.filter((item) => item?.bookName && bookColors[item.bookName])
    .map((item) => ({
      name: item?.bookName ?? '',
      value: item?.score ?? 0,
      color: bookColors[item?.bookName ?? ''],
    }));

  const chartConfig = Object.fromEntries(
    Object.entries(bookColors).map(([bookName, color]) => [
      bookName,
      { label: bookName, color },
    ]),
  );

  return (
    <Card className="w-fit h-full min-h-96">
      <CardHeader>
        <CardTitle>Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && (
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              layout="vertical"
              width={400}
              height={300}
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value">
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
