"use client";
import { answerQuestion } from "@/app/actions/streamable_objects";
import { Answer, BookAnalysis, Citation, Document } from "@/baml_client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { readStreamableValue } from "ai/rsc";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { unstable_noStore as noStore } from "next/cache";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { documents } from "@/lib/rag-docs";
import clsx from "clsx";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function Home() {
  const [text, setText] = useState(`What are 3 spacex achievements?
  `);
  const [answer, setAnswer] = useState<Partial<Answer> | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const getCitationContext = (citation: Citation, documents: Document[]) => {
    const document = documents.find(
      (d) => d.title.toLowerCase() === citation.documentTitle.toLowerCase()
    );
    if (!document) return null;

    const citedText = citation.relevantTextFromDocument;
    const fullText = document.text;

    const lowerFullText = fullText.toLowerCase();
    const lowerCitedText = citedText.toLowerCase();
    console.log(citation);
    console.log(citedText);
    console.log(fullText);

    let citationIndex = lowerFullText.indexOf(lowerCitedText);

    if (citationIndex !== -1) {
      return createContext(fullText, citedText, citationIndex, document);
    }
    console.warn("citation not found, trying to strip----------------------");

    // If not found, strip citation numbers from fullText and try again
    const strippedFullText = lowerFullText.replace(/\[\d+\]/g, "");
    const strippedCitedText = lowerCitedText.replace(/\[\d+\]/g, "");
    const strippedIndex = strippedFullText.indexOf(strippedCitedText);

    if (strippedIndex !== -1) {
      return createContext(
        strippedFullText,
        strippedCitedText,
        strippedIndex,
        document
      );
    }
    console.log(strippedFullText);
    console.log(strippedCitedText);
    console.log(strippedIndex);

    console.error("Citation not found in document text", {
      citation,
      strippedCitedText,
      doc: document.title,
    });
    return null;
  };

  const createContext = (
    text: string,
    citedText: string,
    index: number,
    document: Document
  ) => {
    const startIndex = Math.max(0, index - 200);
    const endIndex = Math.min(text.length, index + citedText.length + 200);

    return {
      before: text.slice(startIndex, index),
      cited: citedText,
      after: text.slice(index + citedText.length, endIndex),
      title: document.title,
      link: document.link,
    };
  };

  const createWikipediaLink = (link: string, citedText: string) => {
    const encodedText = encodeURIComponent(
      citedText.replace(/\s+/g, " ").trim()
    );
    return `${link}#:~:text=${encodedText}`;
  };

  const renderAnswer = (answerText: string) => {
    const parts = answerText.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      if (part.match(/^\[\d+\]$/)) {
        const citationNumber = part.slice(1, -1);
        const citation = answer?.answersInText?.find(
          (c) => c.number === parseInt(citationNumber)
        );

        if (!citation) return part;
        const context = getCitationContext(citation, documents);
        return (
          <HoverCard openDelay={100} closeDelay={100} key={index}>
            <HoverCardTrigger asChild>
              <sup
                className={clsx(
                  "cursor-pointer inline-block font-bold text-base",
                  [
                    context!!
                      ? "text-blue-500 hover:underline"
                      : "text-orange-500",
                  ]
                )}
              >
                {citationNumber}
              </sup>
            </HoverCardTrigger>
            <HoverCardContent side={"top"} className="w-[500px]">
              {context ? (
                <>
                  <h4 className="font-semibold mb-2">{context.title}</h4>
                  <p>
                    ...{context.before}
                    <span className="bg-yellow-200">{context.cited}</span>
                    {context.after}...
                  </p>
                  <a
                    href={createWikipediaLink(context.link, context.cited)}
                    className="text-blue-500 hover:underline mt-2 block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source
                  </a>
                </>
              ) : (
                <p>
                  Warning: No exact match found in original text for this
                  citation. The AI might have not quoted exactly.
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        );
      }
      return part;
    });
  };
  const numCitations = answer?.answersInText?.length ?? 0;

  return (
    <>
      <div className="px-12 flex flex-col items-center w-full py-8 overflow-y-auto">
        <div className="4xl:max-w-[300px] flex flex-col h-fit items-center gap-y-4">
          <div className="font-semibold text-3xl">RAG Example</div>
          <div className="">
            Ask a question to the AI about this{" "}
            <Link
              className="text-blue-500 hover:underline"
              href={"https://en.wikipedia.org/wiki/SpaceX"}
            >
              SpaceX
            </Link>{" "}
            wikpedia article to see how RAG works!
          </div>
          <div className="w-full flex flex-col mt-18 border-border bg-muted rounded-md border-[1px] p-4 items-center">
            <div className="font-semibold w-full text-left pl-1">Question</div>
            <Input
              className="w-[600px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              disabled={isLoading}
              onClick={async () => {
                const { object } = await answerQuestion(text);
                setIsLoading(true);
                for await (const partialObject of readStreamableValue(object)) {
                  setAnswer(partialObject);
                }
                setIsLoading(false);
              }}
              className="w-fit flex mt-2"
            >
              Submit
            </Button>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="font-semibold flex flex-row text-lg gap-x-1">
              <div>Answer</div>
              <span>
                {isLoading && (
                  <div className="">
                    <ClipLoader color="gray" size={12} />
                  </div>
                )}
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto border-[1px] border-border break-words whitespace-pre-wrap py-3 rounded-md max-w-[600px] text-sm text-foreground/80 shadow-md bg-slate-100 px-3">
              {answer?.answer ? (
                <>{renderAnswer(answer.answer)}</>
              ) : (
                <div className="min-h-[50px]">
                  {isLoading && (
                    <div>
                      Gathering{" "}
                      {numCitations > 0 ? numCitations.toString() : ""}{" "}
                      citations...
                    </div>
                  )}
                </div>
              )}{" "}
            </div>

            <div>
              <div className="flex flex-col w-full">
                <span className="font-semibold">Citations</span>{" "}
                <div className="border-border border-[1px] p-2 text-xs rounded-md min-h-[100px] max-w-[600px] flex flex-col -z-10">
                  {answer?.answersInText?.map((answer, index) => (
                    <div
                      key={index}
                      className="whitespace-pre-wrap break-words flex flex-row"
                    >
                      <div className="">
                        <span className="font-semibold">[{answer.number}]</span>{" "}
                        {answer.relevantTextFromDocument}
                        {/* links can cause exceptions if the link is incomplete, so we render it at the end */}
                        {!isLoading && (
                          <Link
                            href={answer.sourceLink ?? "/"}
                            className="text-blue-500 pl-1"
                          >
                            {answer.documentTitle}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="">
              {/* <hr className="" /> */}
              <div className="font-semibold">Parsed JSON from LLM response</div>
              <Textarea
                className="w-[600px] h-[160px] mt-4"
                value={JSON.stringify(answer, null, 2) ?? ""}
                readOnly
                draggable={false}
                contentEditable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
