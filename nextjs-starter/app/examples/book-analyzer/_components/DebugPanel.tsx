import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cog } from 'lucide-react';
import { memo } from 'react';
import JsonView from 'react18-json-view';
import ErrorPreview from '../../_components/ErrorPreview';
import { Status } from '../../_components/Status';
import { useBookAnalyzer } from '../_context/BookAnalyzerContext';

export const DebugPanel = memo(() => {
  const { answerAction } = useBookAnalyzer();

  return (
    <Card className="w-full shadow-lg sticky top-4">
      <CardHeader className="bg-gray-100 border-b">
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cog className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-semibold">Debug Panel</span>
            </div>
            <Status status={answerAction.status} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {answerAction.error && <ErrorPreview error={answerAction.error} />}
        <ScrollArea className="h-[600px] text-xs bg-muted">
          <JsonView
            src={answerAction.data}
            theme="atom"
            collapseStringsAfterLength={50}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

DebugPanel.displayName = 'DebugPanel';
