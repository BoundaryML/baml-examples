import type { HookOutput } from '@/baml_client/react/hooks';
import { useAnalyzeBooks } from '@/baml_client/react/hooks';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import examples from '../examples';

interface BookAnalyzerContextType {
  query: string;
  setQuery: (value: string) => void;
  answerAction: HookOutput<'AnalyzeBooks'>;
  bookColors: Record<string, string>;
  activeColorPicker: string | null;
  setActiveColorPicker: (book: string | null) => void;
  handleAnalyze: (text: string) => void;
  handleColorChange: (color: string, book: string) => void;
}

const BookAnalyzerContext = createContext<BookAnalyzerContextType | null>(null);

export const useBookAnalyzer = () => {
  const context = useContext(BookAnalyzerContext);
  if (!context) {
    throw new Error(
      'useBookAnalyzer must be used within a BookAnalyzerProvider',
    );
  }
  return context;
};

export const BookAnalyzerProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [query, setQuery] = useState(examples[0].query);
  const [bookColors, setBookColors] = useState<Record<string, string>>({});
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
    null,
  );
  const answerAction = useAnalyzeBooks();

  const books = useMemo(
    () =>
      answerAction.data?.bookNames?.filter((book): book is string => !!book) ??
      [],
    [answerAction.data],
  );

  const handleAnalyze = useCallback(
    (text: string) => {
      if (text.trim()) {
        answerAction.mutate(text);
      }
    },
    [answerAction],
  );

  const handleColorChange = useCallback((color: string, book: string) => {
    setBookColors((prev) => ({ ...prev, [book]: color }));
  }, []);

  useEffect(() => {
    setBookColors((prev) => {
      const newBookColors: Record<string, string> = {};
      books.forEach((book, index) => {
        if (book && !prev[book]) {
          newBookColors[book] =
            `hsl(${(index * 360) / books.length}, 70%, 50%)`;
        }
      });
      if (Object.keys(newBookColors).length === 0) {
        return prev;
      }
      return { ...prev, ...newBookColors };
    });
  }, [books]);

  const contextValue = useMemo(
    () => ({
      query,
      setQuery,
      answerAction,
      bookColors,
      activeColorPicker,
      setActiveColorPicker,
      handleAnalyze,
      handleColorChange,
    }),
    [
      query,
      answerAction,
      bookColors,
      activeColorPicker,
      handleAnalyze,
      handleColorChange,
    ],
  );

  return (
    <BookAnalyzerContext.Provider value={contextValue}>
      {children}
    </BookAnalyzerContext.Provider>
  );
};
