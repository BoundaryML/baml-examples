import type { partial_types } from '@/baml_client/partial_types';
import type { Citation } from '@/baml_client/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { documents } from '@/lib/rag-docs';
import { CheckCircle2, Cog, XCircle } from 'lucide-react';
import { memo } from 'react';
import JsonView from 'react18-json-view';
import ErrorPreview from '../../_components/ErrorPreview';
import { Status } from '../../_components/Status';
import { useRag } from '../_context/RagContext';
import { createWikipediaLink, getCitationContext } from '../utils';

export const DebugPanel = memo(() => {
  const { answerAction } = useRag();
  const data = answerAction.isSuccess
    ? answerAction.data
    : answerAction.isPending
      ? answerAction.streamData
      : null;

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cog className="h-6 w-6 text-gray-300" />
              <span className="text-xl font-semibold">Debug Panel</span>
            </div>
            <Status status={answerAction.status} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {answerAction.status === 'error' && answerAction.error && (
          <ErrorPreview error={answerAction.error} />
        )}
        <Tabs defaultValue="citations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-none">
            <TabsTrigger
              value="citations"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              Citations
            </TabsTrigger>
            <TabsTrigger
              value="json"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              JSON View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="citations" className="p-4">
            {answerAction.data && (
              <div className="text-xs text-gray-800">
                Found {answerAction.data.answersInText?.length ?? 0} citations.
              </div>
            )}

            {answerAction.data?.answersInText?.map(
              (citation) =>
                citation && (
                  <ShowCitation key={citation.number} citation={citation} />
                ),
            )}
          </TabsContent>
          <TabsContent value="json" className="border-t p-4 bg-gray-50 text-xs">
            <JsonView src={data} theme="atom" collapseStringsAfterLength={50} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

DebugPanel.displayName = 'DebugPanel';

interface ShowCitationProps {
  citation: Citation | partial_types.Citation;
}

const ShowCitation = memo<ShowCitationProps>(({ citation }) => {
  const context =
    citation.documentTitle && citation.relevantTextFromDocument
      ? getCitationContext(
          {
            documentTitle: citation.documentTitle,
            relevantTextFromDocument: citation.relevantTextFromDocument,
          },
          documents,
        )
      : null;
  const isCitationFound = !!context;

  return (
    <Card className="mb-4 last:mb-0 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-200">
      <CardHeader className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Citation [{citation.number}]
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={isCitationFound ? 'default' : 'destructive'}
                className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
              >
                {isCitationFound ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {isCitationFound ? 'Found' : 'Not Found'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {isCitationFound
                ? 'This citation was found in the source documents'
                : 'This citation could not be found in the source documents'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
          {citation.relevantTextFromDocument}
        </div>
        {isCitationFound && context && (
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">{context.title}</p>
            <p className="mt-1 leading-relaxed">
              ...{context.before}
              <span className="bg-yellow-100 px-1 rounded">
                {context.cited}
              </span>
              {context.after}...
            </p>
            <a
              href={createWikipediaLink(context.link, context.cited)}
              className="text-blue-600 hover:underline mt-2 inline-block font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Wikipedia
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ShowCitation.displayName = 'ShowCitation';
