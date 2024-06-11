"use client";
import { answerQuestion } from "@/app/actions/streamable_objects";
import { Answer, BookAnalysis } from "@/baml_client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sortJsonRecursive } from "@/lib/utils";
import { readStreamableValue } from "ai/rsc";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export default function Home() {
  noStore();
  const [text, setText] =
    useState(`What achievements did spacex accomplish before anyone else?
  `);
  const [answer, setAnswer] = useState<Partial<Answer> | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <>
      <div className="mx-12 flex flex-col items-center w-full  py-8">
        <div className="max-w-[800px] flex flex-col items-center gap-y-4">
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
            <Textarea
              className="w-[600px] h-[120px]"
              value={answer?.answer}
              readOnly
              draggable={false}
              contentEditable={false}
            />
            <div>
              <div className="flex flex-col w-full">
                <span className="font-semibold">Citations</span>{" "}
                <div className="border-border border-[1px] p-2 text-xs rounded-md min-h-[100px] max-w-[600px]">
                  {answer?.answersInText?.map((answer, index) => (
                    <span
                      key={index}
                      className="whitespace-pre-wrap break-words"
                    >
                      <span className="font-semibold">[{answer.number}]</span>{" "}
                      {answer.relevantTextFromDocument} --{" "}
                      <Link
                        href={answer.sourceLink ?? ""}
                        className="text-blue-500"
                      >
                        {answer.documentTitle}
                      </Link>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="">
              {/* <hr className="" /> */}
              <div className="font-semibold">Parsed JSON from LLM response</div>
              <Textarea
                className="w-[600px] h-[160px] mt-4"
                value={JSON.stringify(sortJsonRecursive(answer), null, 2) ?? ""}
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
