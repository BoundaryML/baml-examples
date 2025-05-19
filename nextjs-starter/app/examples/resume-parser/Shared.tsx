'use client';
import {
  type FunctionNames,
  type HookOutput,
  useExtractResume,
  useExtractResumeNoStructure,
} from '@/baml_client/react/hooks';

import { AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Code, FileText, Loader2 } from 'lucide-react';
import { type JSX, useState } from 'react';
import JsonView from 'react18-json-view';
import ErrorPreview from '../_components/ErrorPreview';
import { Status } from '../_components/Status';
import PartialResume from './PartialResume';
import examples from './examples';

const LoadPresetExample: React.FC<{
  setResume: (value: string) => void;
}> = ({ setResume }) => {
  const handleExampleChange = (value: keyof typeof examples) => {
    setResume(examples[value].value);
  };

  return (
    <div className="flex flex-wrap gap-2 p-1">
      {Object.entries(examples).map(([key, { title }]) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          onClick={() => handleExampleChange(key as keyof typeof examples)}
          className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs"
        >
          {title}
        </Button>
      ))}
    </div>
  );
};

const ResumeInput: React.FC<{
  resumeText: string;
  setResumeText: (value: string) => void;
  isLoading: boolean;
  onClick: () => void;
}> = ({ resumeText, setResumeText, isLoading, onClick }) => {
  return (
    <Card className="col-span-1 bg-white shadow-lg rounded-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">Raw Resume</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 mb-6 text-sm text-gray-600">
          <p>
            Enter a resume of your choice or select from the examples below:
          </p>
          <LoadPresetExample setResume={setResumeText} />
        </div>
        <Textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Enter your resume text here..."
          className="h-[300px] text-sm resize-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          disabled={isLoading}
        />
        <Button
          onClick={onClick}
          disabled={isLoading}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Extracting...
            </>
          ) : (
            <>Extract Resume</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export const Content: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>(examples.vaibhav.value);

  const structuredResume = useExtractResume();
  const unstructuredResume = useExtractResumeNoStructure();

  const handleExtract = async () => {
    await Promise.allSettled([
      structuredResume.mutate(resumeText),
      unstructuredResume.mutate(resumeText),
    ]);
  };

  const [mode, setMode] = useState<'pretty' | 'json'>('pretty');

  return (
    <div className="container mx-auto py-4 px-4 bg-gradient-to-b from-gray-50 to-white">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Streaming Objects with BAML
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ResumeInput
          {...{
            resumeText,
            setResumeText,
            isLoading:
              structuredResume.isPending || unstructuredResume.isPending,
            onClick: handleExtract,
          }}
        />

        <Card className="col-span-1 bg-white shadow-lg rounded-xl overflow-hidden border-0">
          <CardHeader className="relative bg-gradient-to-r from-gray-400 to-gray-600 text-white p-6">
            <CardTitle className="text-2xl font-bold">
              Extracted Resume
            </CardTitle>
            {(structuredResume.status !== 'idle' ||
              unstructuredResume.status !== 'idle') && (
              <div className="flex items-center gap-2 text-sm absolute top-6 right-6">
                <Switch
                  checked={mode === 'pretty'}
                  onCheckedChange={(checked) => {
                    setMode(checked ? 'pretty' : 'json');
                  }}
                />
                <span className="font-medium">
                  {mode === 'pretty' ? 'Pretty' : 'JSON'}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="unstructured" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="unstructured"
                  className="relative flex flex-row justify-between items-center px-4 transition-all duration-300"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Unstructured</span>
                  </div>
                  <Status status={unstructuredResume.status} />
                </TabsTrigger>
                <TabsTrigger
                  value="structured"
                  className="relative flex flex-row justify-between items-center px-4 transition-all duration-300"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <Code className="h-5 w-5" />
                    <span className="font-medium">Structured</span>
                  </div>
                  <Status status={structuredResume.status} />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unstructured">
                <ResumeTabContent
                  state={unstructuredResume}
                  renderComponent={UnstructuredResume}
                  mode={mode}
                />
              </TabsContent>

              <TabsContent value="structured">
                <ResumeTabContent
                  state={structuredResume}
                  renderComponent={PartialResume}
                  mode={mode}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UnstructuredResume = ({
  resume,
}: { resume: HookOutput<'ExtractResumeNoStructure'>['data'] }) => {
  return (
    <Card className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <ScrollArea className="h-80">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {resume}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

function ResumeTabContent<T extends FunctionNames>({
  state,
  renderComponent,
  mode,
}: {
  state: HookOutput<T>;
  mode: 'pretty' | 'json';
  renderComponent: (props: {
    resume: HookOutput<T>['data'];
  }) => JSX.Element;
}) {
  const content = (data: HookOutput<T>['data']) => {
    if (mode === 'pretty') {
      return renderComponent({ resume: data });
    }
    return (
      <Card className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <CardContent className="p-4">
          <ScrollArea className="h-80">
            <JsonView src={data} theme="atom" />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mt-4">
      {state.error && <ErrorPreview error={state.error} />}
      {state.isSuccess && (
        <div className="flex flex-row gap-2 items-center mb-4 bg-green-100 text-green-800 px-4 py-2 rounded-md">
          <CheckCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">
            Extraction Completed
          </AlertTitle>
        </div>
      )}
      {state.data && content(state.data)}
    </div>
  );
}

export default Content;
