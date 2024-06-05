"use client";
import {
  AreaChart,
  BarChart,
  BarList,
  Button,
  Card,
  TextInput,
  Textarea,
} from "@tremor/react";
import { useEffect, useState } from "react";
import {
  BookAnalysis,
  WordCount,
  Score,
  PopularityOverTime,
  Ranking,
} from "@/baml_client";
import { analyzeBook } from "@/app/actions/streamable_objects";
import { readStreamableValue } from "ai/rsc";
import { ClipLoader } from "react-spinners";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@react-hook/debounce";

function sortJsonRecursive(obj: any) {
  if (obj instanceof Array) {
    return obj.map(sortJsonRecursive);
  } else if (obj instanceof Object) {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = sortJsonRecursive(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

export default function Home() {
  const [text, setText] = useState(`The Great Gatsby
Three Body Problem
The Lord of the Rings`);
  const [bookAnalysis, setBookAnalysis] = useState<
    Partial<BookAnalysis> | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <>
      <div className="h-screen w-screen bg-slate-50 overflow-y-scroll">
        <div className="p-10 gap-y-4 flex flex-col">
          <div className="font-semibold text-2xl">Book AI Analyzer</div>
          <div className="font-semibold ">
            Add / Remove books from this list!
          </div>

          <Textarea
            defaultValue={text}
            onValueChange={setText}
            className="h-24"
          />
          <Button
            disabled={isLoading}
            onClick={async () => {
              const { object } = await analyzeBook(text);
              setIsLoading(true);
              for await (const partialObject of readStreamableValue(object)) {
                setBookAnalysis(partialObject);
              }
              setIsLoading(false);
            }}
          >
            Analyze
          </Button>
          {isLoading && (
            <div className="absolute top-0 bottom-0 right-0">
              <ClipLoader color="gray" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="airplane-mode"
              checked={showRaw}
              onCheckedChange={setShowRaw}
            />
            <Label htmlFor="airplane-mode">Show Raw JSON</Label>
          </div>
          {showRaw ? (
            <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200">
              <pre>
                {JSON.stringify(sortJsonRecursive(bookAnalysis), null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PopularityLineChart
                  popularityData={bookAnalysis?.popularityOverTime ?? []}
                  books={bookAnalysis?.bookNames}
                />
                <RankingChart
                  rankingData={bookAnalysis?.popularityRankings ?? []}
                  books={bookAnalysis?.bookNames ?? []}
                />
                <WordCountChart
                  wordCountData={bookAnalysis?.wordCounts ?? []}
                  books={bookAnalysis?.bookNames ?? []}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const PopularityLineChart = ({
  popularityData,
  books,
}: {
  popularityData: Partial<PopularityOverTime>[];
  books?: string[];
}) => {
  // Create a dictionary to hold data by year
  const dataByYear: { [year: number]: any } = {};
  // Populate the dictionary
  popularityData.forEach((book) => {
    book.scores?.forEach((score) => {
      if (score?.year?.toString().length !== 4) return; // valid year since it's streaming in
      if (!dataByYear[score.year]) {
        dataByYear[score.year] = { date: `Year ${score.year}` };
      }
      if (books?.includes(book?.bookName ?? "")) {
        dataByYear[score.year][book?.bookName ?? ""] = score.score;
      }
    });
  });

  // Convert dictionary to array format required
  const chartData = Object.values(dataByYear);

  return (
    <Card className="">
      <h3 className="text-tremor-title ">Popularity over time</h3>{" "}
      <AreaChart
        className="h-[150px]"
        data={chartData}
        index="date"
        categories={books ?? []}
        colors={["blue", "green", "magenta", "red"]}
        yAxisWidth={12}
        showYAxis={false}
      />
    </Card>
  );
};

const RankingChart = ({
  rankingData,
  books,
}: {
  rankingData: Partial<Ranking>[];
  books?: string[];
}) => {
  const chartData = rankingData?.map((item) => {
    if (!books?.includes(item.bookName ?? "")) {
      return { name: "", value: 0 };
    }
    return { name: item?.bookName ?? "", value: item.score ?? 0 };
  });

  return (
    <>
      <Card>
        <h3 className="text-tremor-title ">Ratings</h3>{" "}
        <BarList data={chartData} className="mx-auto max-w-sm" />{" "}
      </Card>
    </>
  );
};

const WordCountChart = ({
  wordCountData,
  books,
}: {
  wordCountData: Partial<WordCount>[];
  books: string[];
}) => {
  const chartData = wordCountData?.map((item) => {
    if (!books.includes(item.bookName ?? "")) {
      return { name: "", "Word Count": 0 };
    }
    return { name: item.bookName ?? "", "Word Count": item.count ?? 0 };
  });

  return (
    <Card>
      <h3 className="text-tremor-title ">Word Count</h3>{" "}
      <BarChart
        data={chartData}
        index="name"
        categories={["Word Count"]}
        colors={["blue", "green", "magenta", "red"]}
        yAxisWidth={48}
        onValueChange={(v) => console.log(v)}
      />
    </Card>
  );
};
