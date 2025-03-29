"use client";

import type { partial_types } from "@/baml_client/partial_types";
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
import { b } from "@/baml_client/async_client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { PopularityLineChart as InternalPopularityLineChart } from "./PopularityChart";

export const PopularityLineChart = ({
  popularityData,
  bookColors,
}: {
  popularityData: partial_types.BookAnalysis['popularityOverTime'];
  bookColors: Record<string, string>;
}) => {
  // Transform into {date: year, [book]: score}[]
  const data = useMemo(() => {
    const transformedData: { date: number, [key: string]: number }[] = [];

    popularityData?.forEach((item) => {
      if (item && item.bookName && bookColors[item.bookName] !== undefined) {
        const name = item.bookName;
        item.scores?.forEach((score) => {
          if (score && score.year && score.score !== null && score.score !== undefined) {
            const year = score.year;
            let yearData = transformedData.find((entry) => entry.date === year);
            if (!yearData) {
              transformedData.push({ date: year, [name]: score.score });
            } else {
              yearData[name] = score.score;
            }
          }
        });
      }
    });

    // Sort by date
    return transformedData.sort((a, b) => a.date - b.date);
  }, [popularityData, bookColors]);

  return <InternalPopularityLineChart popularityData={data} bookColors={bookColors} />;
};
