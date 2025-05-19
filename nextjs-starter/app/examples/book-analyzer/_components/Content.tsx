'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import {
  BookAnalyzerProvider,
  useBookAnalyzer,
} from '../_context/BookAnalyzerContext';
import { AnalysisResults } from './AnalysisResults';
import { BookInput } from './BookInput';
import { DebugPanel } from './DebugPanel';

const BookAnalyzerContent = memo(() => {
  const { answerAction } = useBookAnalyzer();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
          Book Popularity Analyzer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookInput />

            <AnimatePresence>
              {answerAction.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-red-500 text-sm">
                    Sorry! Something went wrong. Please try again.
                  </p>
                </motion.div>
              )}
              <AnalysisResults />
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <DebugPanel />
          </div>
        </div>
      </div>
    </div>
  );
});

BookAnalyzerContent.displayName = 'BookAnalyzerContent';

export const Content: React.FC = () => {
  return (
    <BookAnalyzerProvider>
      <BookAnalyzerContent />
    </BookAnalyzerProvider>
  );
};

export default Content;
