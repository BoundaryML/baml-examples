import type { HookOutput } from '@/baml_client/react/hooks';
import { useAnswerQuestion } from '@/baml_client/react/hooks';
import { documents } from '@/lib/rag-docs';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import examples from '../examples';

interface RagContextType {
  question: string;
  setQuestion: (value: string) => void;
  answerAction: HookOutput<'AnswerQuestion'>;
  submitQuestion: () => void;
}

const RagContext = createContext<RagContextType | null>(null);

export const useRag = () => {
  const context = useContext(RagContext);
  if (!context) {
    throw new Error('useRag must be used within a RagProvider');
  }
  return context;
};

export const RagProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [question, setQuestion] = useState(examples.basic.value);
  const answerAction = useAnswerQuestion();

  const submitQuestion = useCallback(() => {
    if (question.trim()) {
      answerAction.mutate(question, { documents });
    }
  }, [question, answerAction]);

  const contextValue = {
    question,
    setQuestion,
    answerAction,
    submitQuestion,
  };

  return (
    <RagContext.Provider value={contextValue}>{children}</RagContext.Provider>
  );
};
