"use client";

import type { Guide, Query } from "@/baml_client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecursivePartialNull } from "@/baml_client/async_client";
import { type ReactNode, useState, useEffect } from "react";
import { CheckCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchProsource, type SearchResult, type Classification, type NonNullableQuery } from "@/app/actions/prosource";
import { Badge } from "@/components/ui/badge";

export const GuideRender = ({
  name,
  guide,
  state,
}: {
  name: string;
  guide: RecursivePartialNull<Guide>;
  state: "idle" | "loading" | "success";
}) => {
  const filterTopics = (category: "packaging" | "processing") => 
    guide.related_topics?.filter((t): t is NonNullableQuery => 
      t?.category === category && 
      t.category !== null && 
      t.category !== undefined && 
      t.phrase !== null && 
      t.phrase !== undefined
    ) ?? [];

  const packagingTopics = filterTopics("packaging");
  const processingTopics = filterTopics("processing");

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="processing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="processing">
              Processing
              {state === "loading" && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
              )}
              {state === "success" && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="packaging">
              Packaging
              {state === "loading" && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
              )}
              {state === "success" && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="processing">
            <ScrollArea className="h-[400px]">
              <InstructionsRender 
                instructions={guide.processing_instructions}
                topics={processingTopics}
                inProgress={state === "loading"}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="packaging">
            <ScrollArea className="h-[400px]">
              <InstructionsRender 
                instructions={guide.packaging_instructions} 
                topics={packagingTopics}
                inProgress={state === "loading"}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const SearchResultCard = ({
  searchResult
}: {
  searchResult: SearchResult;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
        {searchResult.classifications?.length > 0 && (
          <div>
            <div className="font-medium text-sm text-gray-700 mb-1">Equipment Categories:</div>
            <div className="flex flex-wrap gap-2">
              {searchResult.classifications.slice(0, 2).map((c) => (
                <Badge key={c.selected_category_id} className="text-sm pl-2 py-1 rounded-full">
                  {c.selected_category}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* {searchResult.suggestions?.length > 0 && (
          <div>
            <div className="font-medium text-sm text-gray-700 mb-1">Related Searches:</div>
            <div className="flex flex-wrap gap-2">
              {searchResult.suggestions.slice(0, 3).map((suggestion) => (
                <span key={suggestion} className="text-sm text-gray-600 pl-2 py-1 bg-gray-50 rounded-full">
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )} */}
    </div>
  );
};

const InstructionStep = ({
  instruction,
  index,
  totalSteps,
  inProgress
}: {
  instruction: string;
  index: number;
  totalSteps: number;
  inProgress?: boolean;
}) => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inProgress) return;

    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await searchProsource(instruction);
        setSearchResult(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load related equipment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [instruction, inProgress]);

  return (
    <div className="space-y-2">
      <div className="text-gray-700">
        <span className="font-medium text-blue-800">Step {index + 1}:</span>{" "}
        {instruction}
        {(inProgress && index === totalSteps - 1) && (
          <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500 inline" />
        )}
      </div>
      
      {!inProgress && isLoading && (
        <div className="ml-6 text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500 inline" />
          Loading related equipment...
        </div>
      )}

      {!inProgress && error && (
        <div className="ml-6 text-sm text-red-500">
          {error}
        </div>
      )}
      
      {!inProgress && searchResult && (
        <div className="ml-6">
          <SearchResultCard searchResult={searchResult} />
        </div>
      )}
    </div>
  );
};

const InstructionsRender = ({
  instructions,
  topics,
  inProgress
}: {
  instructions?: (string | null | undefined)[];
  topics: NonNullableQuery[];
  inProgress?: boolean;
}) => {
  if (!instructions?.length) {
    return <p className="text-gray-500">No instructions found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {instructions.map((instruction, index) => (
          instruction && (
            <InstructionStep
              key={instruction}
              instruction={instruction}
              index={index}
              totalSteps={instructions.length}
              inProgress={inProgress}
            />
          )
        ))}
      </div>
      {topics.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">Related Topics:</h3>
          <ul className="space-y-1">
            {topics.map((topic) => (
              <li key={topic.phrase} className="text-gray-600">
                • {topic.phrase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
