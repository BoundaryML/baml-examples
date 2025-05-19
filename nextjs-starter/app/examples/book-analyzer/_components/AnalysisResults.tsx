import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useBookAnalyzer } from '../_context/BookAnalyzerContext';
import { BookColorPicker } from './BookColorPicker';
import { PopularityLineChart } from './Charts';
import { RankingChart } from './RankingChart';
import { WordCountChart } from './WordCount';

export const AnalysisResults = memo(() => {
  const { answerAction, bookColors } = useBookAnalyzer();

  if (!answerAction.data) return null;
  //
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <BookColorPicker />
            <div className="space-y-8">
              <PopularityLineChart
                popularityData={answerAction.data.popularityOverTime}
                bookColors={bookColors}
              />
              <RankingChart
                rankingData={answerAction.data.popularityRankings}
                bookColors={bookColors}
              />
              <WordCountChart
                wordCountData={answerAction.data.wordCounts}
                bookColors={bookColors}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnalysisResults.displayName = 'AnalysisResults';
