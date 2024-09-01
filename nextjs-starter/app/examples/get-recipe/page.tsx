"use client";
import { answerQuestion, getRecipe } from "@/app/actions/streamable_objects";
import { Ingredient, PartIngredient, PartSteps, Recipe } from "@/baml_client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { readStreamableValue } from "ai/rsc";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { unstable_noStore as noStore } from "next/cache";
import { Card } from "@tremor/react";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function Home() {
  const [text, setText] = useState(`apple pie`);
  const [answer, setAnswer] = useState<Partial<Recipe> | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <>
      <div className="mx-12 flex flex-col items-center w-full  py-8">
        <div className="max-w-[800px] flex flex-col items-center gap-y-4">
          <div className="font-semibold text-3xl">Get recipe</div>

          <div className="w-full flex flex-col mt-18 border-border bg-muted rounded-md border-[1px] p-4 items-center">
            <div className="font-semibold w-full text-left pl-1">
              Input a dish
            </div>
            <Input
              className="w-[600px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);

                const { object } = await getRecipe(text);
                for await (const partialObject of readStreamableValue(object)) {
                  setAnswer(partialObject as Partial<Recipe>);
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
            <div>{answer && <RecipeRender recipe={answer} />}</div>
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
    </>
  );
}

const RecipeRender = ({ recipe }: { recipe: Partial<Recipe> }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="py-4">Servings: {recipe.number_of_servings}</div>
      <Card title="Ingredients">
        <div className="font-semibold text-lg py-4">Ingredients</div>

        <IngredientListRender ingredients={recipe.ingredients ?? []} />
      </Card>
      <Card title="Instructions" className="mt-8">
        <div className="font-semibold text-lg py-4">Instructions</div>

        <InstructionListRender instructions={recipe.instructions ?? []} />
      </Card>
    </div>
  );
};

const IngredientListRender = ({
  ingredients,
}: {
  ingredients: Ingredient[] | PartIngredient[];
}) => {
  if (ingredients.length === 0) {
    return <></>;
  }

  if ("title" in ingredients[0]) {
    // PartIngredient
    return (
      <div className="py-2 gap-y-3">
        {(ingredients as PartIngredient[]).map((part, index) => {
          return (
            <div key={index} className="grid grid-cols-4 gap-4 py-2">
              <div className="font-semibold text-base">{part.title}</div>
              <div className="col-span-3">
                {part.ingredients.map((ingredient, index) => {
                  return (
                    <IngredientRender key={index} ingredient={ingredient} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="py-2">
      {(ingredients as Ingredient[]).map((ingredient, index) => {
        return <IngredientRender key={index} ingredient={ingredient} />;
      })}
    </div>
  );
};

const IngredientRender = ({ ingredient }: { ingredient: Ingredient }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        {ingredient.amount} {ingredient.unit}
      </div>
      <div>{ingredient.name}</div>
    </div>
  );
};

const InstructionListRender = ({
  instructions,
}: {
  instructions: string[] | PartSteps[];
}) => {
  return (
    <div className="flex flex-col gap-y-3">
      {/* <div className="font-semibold py-2 text-lg">Instructions</div> */}
      {instructions.map((instruction, index) => {
        if (typeof instruction === "object") {
          return (
            <div key={index} className="grid grid-cols-5 gap-2">
              <div className="font-semibold">{instruction.title}</div>
              <div className="col-span-4">
                <InstructionRender instruction={instruction.steps} />
              </div>
            </div>
          );
        }
        return (
          <SingleStepRender key={index} step={instruction} index={index} />
        );
      })}
    </div>
  );
};

const InstructionRender = ({ instruction }: { instruction: string[] }) => {
  return (
    <div className="gap-y-2 flex flex-col">
      {instruction.map((step, index) => {
        return <SingleStepRender key={index} step={step} index={index} />;
      })}
    </div>
  );
};

const SingleStepRender = ({ step, index }: { step: string; index: number }) => {
  return (
    <div className="flex flex-row gap-x-2">
      <div className="text-muted-foreground">{index + 1}</div>
      <div>{step}</div>
    </div>
  );
};
