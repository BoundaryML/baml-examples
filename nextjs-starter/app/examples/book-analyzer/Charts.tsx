"use client";

import {
  BarChart
} from "@/components/charts/bar_chart";
import {
    LineChart,
    LineChartEventProps
} from "@/components/charts/line_chart";
import {
    BarList
} from "@/components/charts/bar_list";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { PopularityLineChart as InternalPopularityLineChart } from "./PopularityChart";
import type { HookResultPartialData } from "@/baml_client/react/types";
import type { AnalyzeBooksAction } from "@/baml_client/react/server";
import type { PopularityOverTime } from "@/baml_client/types";


export const PopularityLineChart = ({
  popularityData,
  bookColors,
}: {
  popularityData: HookResultPartialData<typeof AnalyzeBooksAction>['popularityOverTime'];
  bookColors: Record<string, string>;
}) => {
  // Transform into {date: year, [book]: score}[]
  const data = useMemo(() => {
    const transformedData: { date: number, [key: string]: number }[] = [];

    // Filter out undefined/null values and ensure type safety
    const validData = popularityData?.filter((item): item is NonNullable<typeof item> =>
      item !== undefined && item !== null &&
      item.bookName !== undefined && item.bookName !== null &&
      Array.isArray(item.scores)
    ) ?? [];

    for (const item of validData) {
      const name = item.bookName;
      if (bookColors[name ?? ''] === undefined) continue;

      for (const score of (item.scores ?? [])) {
        if (score?.year != null && score.score != null) {
          const year = score.year;
          const yearData = transformedData.find((entry) => entry.date === year);
          if (!yearData) {
            transformedData.push({ date: year, [name ?? '']: score.score });
          } else {
            yearData[name ?? ''] = score.score;
          }
        }
      }
    }

    // Sort by date
    return transformedData.sort((a, b) => a.date - b.date);
  }, [popularityData, bookColors]);

  return <InternalPopularityLineChart popularityData={data} bookColors={bookColors} />;
};
