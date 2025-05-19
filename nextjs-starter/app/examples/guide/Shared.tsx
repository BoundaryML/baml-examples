'use client';
import type { HookOutput } from '@/baml_client/react/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {} from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Cog, Loader2 } from 'lucide-react';
import { useState } from 'react';
import JsonView from 'react18-json-view';
import ErrorPreview from '../_components/ErrorPreview';
import { Status } from '../_components/Status';
import { GuideRender } from './Recipe';
import preloadedExamples from './examples';

export const Content: React.FC<{
  query: string;
  setQuery: (value: string) => void;
  answer: HookOutput<'GenerateGuide'>;
}> = ({ query, setQuery, answer }) => {
  const [name, setName] = useState<string>('');

  const handleSubmit = async (text: string) => {
    answer.mutate(text);
    setName(text);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-8">
          Manufacturing Guide
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Generate a Manufacturing Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      className="flex-grow"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter a product name"
                    />
                    <Button
                      onClick={() => handleSubmit(query)}
                      disabled={answer.isPending}
                      className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700"
                    >
                      {answer.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Generate Guide'
                      )}
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Or try one of these:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {preloadedExamples.map((example) => (
                        <Button
                          key={example.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmit(example.query)}
                          className="text-xs"
                        >
                          {example.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <DebugPanel answer={answer} /> */}
          </div>

          <AnimatePresence>
            {answer.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <GuideRender
                  name={name}
                  guide={answer.data}
                  state={answer.status}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const DebugPanel: React.FC<{
  answer: HookOutput<'GenerateGuide'>;
}> = ({ answer }) => {
  return (
    <Card className="w-full shadow-lg h-fit">
      <CardHeader className="bg-gray-100 border-b">
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cog className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-semibold">Debug Panel</span>
            </div>
            <Status status={answer.status} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {answer.error && <ErrorPreview error={answer.error} />}
        <ScrollArea className="h-[300px] text-xs bg-muted">
          <JsonView
            src={answer.data}
            theme="atom"
            collapseStringsAfterLength={50}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Content;
