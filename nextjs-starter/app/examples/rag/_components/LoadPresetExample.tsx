import { Button } from '@/components/ui/button';
import { memo, useCallback } from 'react';
import { useRag } from '../_context/RagContext';
import examples from '../examples';

export const LoadPresetExample = memo(() => {
  const { setQuestion } = useRag();

  const handlePresetClick = useCallback(
    (value: string) => {
      setQuestion(value);
    },
    [setQuestion],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(examples).map(([name, entry]) => (
        <Button
          key={name}
          onClick={() => handlePresetClick(entry.value)}
          variant="outline"
          className="text-xs px-1 py-0 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
        >
          {entry.title}
        </Button>
      ))}
    </div>
  );
});

LoadPresetExample.displayName = 'LoadPresetExample';
