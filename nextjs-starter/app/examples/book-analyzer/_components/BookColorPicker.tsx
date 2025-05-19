import { memo } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useBookAnalyzer } from '../_context/BookAnalyzerContext';

export const BookColorPicker = memo(() => {
  const {
    answerAction,
    bookColors,
    activeColorPicker,
    setActiveColorPicker,
    handleColorChange,
  } = useBookAnalyzer();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">
        Click to change colors (even while streaming)!
      </p>
      <div className="flex flex-wrap gap-2">
        {answerAction.data?.bookNames?.map((book) => (
          <div key={book} className="relative">
            <button
              type="button"
              className="text-blue-900 dark:text-blue-100 p-2 rounded-md flex items-center gap-2 hover:bg-blue-100 transition-colors"
              onClick={() =>
                setActiveColorPicker(activeColorPicker === book ? null : book)
              }
            >
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{
                  backgroundColor: bookColors[book ?? ''],
                }}
              />
              {book}
            </button>
            {activeColorPicker === book && (
              <div className="absolute z-10 mt-2">
                <HexColorPicker
                  color={bookColors[book ?? '']}
                  onChange={(color) => handleColorChange(color, book ?? '')}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

BookColorPicker.displayName = 'BookColorPicker';
