'use client';

import type { partial_types } from '@/baml_client/partial_types';
import { useMemo } from 'react';
import { PopularityLineChart as InternalPopularityLineChart } from './_components/PopularityChart';

export const PopularityLineChart = ({
  popularityData,
  bookColors,
}: {
  popularityData: partial_types.BookAnalysis['popularityOverTime'];
  bookColors: Record<string, string>;
}) => {
  // Transform into {date: year, [book]: score}[]
  const data = useMemo(() => {
    const transformedData: { date: number; [key: string]: number }[] = [];

    for (const item of popularityData ?? []) {
      if (item?.bookName && bookColors[item.bookName] !== undefined) {
        const name = item.bookName;
        for (const score of item.scores ?? []) {
          if (score?.year && score.score != null) {
            const year = score.year;
            const yearData = transformedData.find(
              (entry) => entry.date === year,
            );
            if (!yearData) {
              transformedData.push({ date: year, [name]: score.score });
            } else {
              yearData[name] = score.score;
            }
          }
        }
      }
    }

    // Sort by date
    return transformedData.sort((a, b) => a.date - b.date);
  }, [popularityData, bookColors]);

  return (
    <InternalPopularityLineChart
      popularityData={data}
      bookColors={bookColors}
    />
  );
};
