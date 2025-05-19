'use client';

import { RagProvider } from './_context/RagContext';
import { AnswerContent } from './_components/AnswerContent';
import { DebugPanel } from './_components/DebugPanel';
import { QuestionInput } from './_components/QuestionInput';

const RagContent: React.FC = () => {
  return (
    <div className="px-4 md:px-12 flex flex-col items-center w-full py-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-4xl flex flex-col h-fit items-center gap-y-8">
        <h1 className="font-bold text-4xl text-gray-800 mb-2">RAG Example</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <QuestionInput>
            <AnswerContent />
          </QuestionInput>
          <DebugPanel />
        </div>
      </div>
    </div>
  );
};

export const Content: React.FC = () => {
  return (
    <RagProvider>
      <RagContent />
    </RagProvider>
  );
};

export default Content;
