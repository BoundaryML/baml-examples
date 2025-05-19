import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { type PropsWithChildren, memo, useCallback } from 'react';
import { useRag } from '../_context/RagContext';
import { LoadPresetExample } from './LoadPresetExample';

interface QuestionInputProps {
  children: React.ReactNode;
}

export const QuestionInput = memo<PropsWithChildren<QuestionInputProps>>(
  ({ children }) => {
    const { question, setQuestion, answerAction, submitQuestion } = useRag();

    const handleQuestionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(e.target.value);
      },
      [setQuestion],
    );

    return (
      <Card className="col-span-1 bg-white shadow-lg rounded-xl overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="text-2xl flex flex-row gap-2">
            <Rocket className="w-8 h-8" /> SpaceX Wiki
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6 text-sm text-gray-600">
            <span>
              Ask any question about this{' '}
              <Link
                className="text-blue-500 hover:underline font-medium"
                href={'https://en.wikipedia.org/wiki/SpaceX'}
              >
                SpaceX
              </Link>{' '}
              Wikipedia article to see how RAG works! Or choose a preset
              question:
            </span>
            <LoadPresetExample />
          </div>
          <Textarea
            value={question}
            onChange={handleQuestionChange}
            placeholder="Enter your question here..."
            className="h-[100px] text-sm resize-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            disabled={answerAction.isPending}
          />
          <Button
            onClick={submitQuestion}
            disabled={answerAction.isPending}
            className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {answerAction.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Answering...
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
          {children}
        </CardContent>
      </Card>
    );
  },
);

QuestionInput.displayName = 'QuestionInput';
