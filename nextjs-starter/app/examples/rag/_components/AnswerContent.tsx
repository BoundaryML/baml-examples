import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useRag } from '../_context/RagContext';
import { RenderAnswer } from './RenderAnswer';

export const AnswerContent = memo(() => {
  const { answerAction } = useRag();
  const { data, streamData, status } = answerAction;

  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mt-6 bg-muted shadow-lg rounded-xl overflow-hidden border-0">
        <CardContent className="p-6">
          {status === 'error' && (
            <RenderAnswer
              data={{
                answer:
                  "Sorry, I couldn't find an answer to your question. Please try again.",
                answersInText: [],
              }}
            />
          )}
          {(status === 'success' && data) ||
          (status === 'pending' && streamData) ? (
            <RenderAnswer data={data || streamData} />
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnswerContent.displayName = 'AnswerContent';
