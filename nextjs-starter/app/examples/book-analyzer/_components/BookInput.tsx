import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useBookAnalyzer } from '../_context/BookAnalyzerContext';
import examples from '../examples';

export const BookInput = memo(() => {
  const { query, setQuery, answerAction, handleAnalyze } = useBookAnalyzer();

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery],
  );

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Analyze Your Books</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Try one of these examples:
            </h3>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <Button
                  key={example.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(example.query);
                    handleAnalyze(example.query);
                  }}
                  className="text-xs"
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder="Enter book titles, separated by commas..."
            className="text-sm focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          />
          <Button
            onClick={() => handleAnalyze(query)}
            disabled={answerAction.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {answerAction.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Books'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

BookInput.displayName = 'BookInput';
