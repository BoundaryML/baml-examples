import type { HookOutput } from '@/baml_client/react/hooks';
import type { Citation } from '@/baml_client/types';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { documents } from '@/lib/rag-docs';
import clsx from 'clsx';
import { createWikipediaLink, getCitationContext } from '../utils';

interface RenderAnswerProps {
  data: HookOutput<'AnswerQuestion'>['data'];
}

export const RenderAnswer: React.FC<RenderAnswerProps> = ({ data }) => {
  if (!data?.answersInText) return <LoadingSkeleton />;

  if (!data?.answer) {
    return (
      <>
        <div className="min-h-[50px] text-gray-600">
          Found{' '}
          {data?.answersInText?.length > 0
            ? data?.answersInText?.length.toString()
            : ''}{' '}
          citations...
        </div>
        <LoadingSkeleton />
      </>
    );
  }

  const parts = data?.answer.split(/(\[\d+\])/);
  return (
    <div className="text-lg leading-relaxed text-gray-800">
      {parts.map((part) => {
        if (part.match(/^\[\d+\]$/)) {
          const citationNumber = part.slice(1, -1);
          const citation = data?.answersInText?.find(
            (c) => c?.number === Number.parseInt(citationNumber),
          );

          if (!citation) return part;
          const context = getCitationContext(citation as Citation, documents);

          return (
            <HoverCard key={citationNumber} openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <sup
                  className={clsx(
                    'cursor-pointer inline-block font-bold text-sm',
                    context
                      ? 'text-blue-600 hover:underline'
                      : 'text-orange-500',
                  )}
                >
                  [{citationNumber}]
                </sup>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                className="w-[300px] p-4 bg-white shadow-xl rounded-lg border border-gray-200"
              >
                {context ? (
                  <>
                    <h4 className="font-semibold mb-2 text-gray-800">
                      {context.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ...{context.before}
                      <span className="bg-yellow-100 px-1 rounded">
                        {context.cited}
                      </span>
                      {context.after}...
                    </p>
                    <a
                      href={createWikipediaLink(context.link, context.cited)}
                      className="text-blue-600 hover:underline mt-2 block text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Wikipedia
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    No exact match found for this citation.
                  </p>
                )}
              </HoverCardContent>
            </HoverCard>
          );
        }
        return part;
      })}
    </div>
  );
};

const LoadingSkeleton = () => (
  <>
    <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse" />
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
  </>
);
