"use client";

import type { Ingredient, partial_types, PartIngredient, PartSteps, Recipe, RecursivePartialNull } from "@/baml_client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import  { type ReactNode, useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const RecipeRender = ({
  name,
  recipe,
  state,
}: {
  name: string;
  recipe: partial_types.Recipe;
  state: "idle" | "instructions" | "ingredients" | "done";
}) => {
  const [servings, setServings] = useState(recipe.number_of_servings);
  const servingRatio =
    servings && recipe.number_of_servings && recipe.number_of_servings > 0
      ? servings / recipe.number_of_servings
      : 1;

  useEffect(() => {
    setServings(recipe.number_of_servings);
  }, [recipe.number_of_servings]);

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="flex flex-col gap-2">
          <p className="text-gray-500">
            Servings: {servings}{" "}
            {servingRatio != 1 && (
              <>(scaled from {recipe.number_of_servings})</>
            )}
          </p>
          {servings && (
            <p className="italic text-xs">Modifying this won't use the LLM!</p>
          )}
          {servings && (
            <Slider
              value={[servings]}
              onValueChange={(value) => setServings(value[0])}
              max={Math.max(20, (recipe.number_of_servings || 1) * 2)}
              min={1}
              step={1}
              className="w-[200px]"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">
              Ingredients
              {state === "ingredients" && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
              )}
              {(state === "instructions" || state === "done") && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="instructions">
              Instructions
              {state === "instructions" && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
              )}
              {state === "done" && (
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <ScrollArea className="h-[400px]">
            <IngredientListRender
              ingredients={recipe.ingredients}
              ratio={servingRatio}
              inProgress={state === "ingredients"}
            />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="instructions">
            <ScrollArea className="h-[400px]">
            <InstructionListRender instructions={recipe.instructions} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const IngredientListRender = ({
  ingredients,
  ratio,
  inProgress
}: {
  ingredients: partial_types.Recipe["ingredients"];
  ratio: number;
  inProgress?: boolean;
}) => {
  if (!ingredients || ingredients.length === 0) {
    return <p className="text-gray-500">No ingredients found.</p>;
  }

  if ("title" in ingredients[0]!) {
    return (
      <div className="space-y-6">
        {(ingredients as partial_types.PartIngredient[]).map(
          (part, index) =>
            part && (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-2 flex flex-row items-center">
                {(inProgress && index === ingredients.length - 1) && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
                    {part.title}
                    </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {part.ingredients?.map(
                    (ingredient, idx) =>
                      ingredient && (
                        <IngredientRender
                          key={idx}
                          ingredient={ingredient}
                          ratio={ratio}
                          isLast={inProgress && idx === part.ingredients!.length - 1 && index === ingredients.length - 1}
                        />
                      )
                  )}
                </div>
              </div>
            )
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {(ingredients as partial_types.Ingredient[]).map((ingredient, index) => (
        <IngredientRender key={index} ingredient={ingredient} ratio={ratio} />
      ))}
    </div>
  );
};

const unicodeFractions: { [key: string]: string } = {
  "1/4": "¼",
  "1/2": "½",
  "3/4": "¾",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const formatFraction = (numerator: number, denominator: number): ReactNode => {
  if (numerator === denominator) {
    return "1";
  }
  const fraction = `${numerator}/${denominator}`;
  if (fraction in unicodeFractions) {
    return unicodeFractions[fraction];
  }
  return (
    <>
      <sup>{numerator}</sup>⁄<sub>{denominator}</sub>
    </>
  );
};

const formatAmount = (value: number): ReactNode => {
  const tolerance = 1.0e-6;
  let h1 = 1,
    h2 = 0,
    k1 = 0,
    k2 = 1;
  let b = value;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(value - h1 / k1) > value * tolerance);

  const factor = gcd(h1, k1);
  const numerator = h1 / factor;
  const denominator = k1 / factor;

  if (numerator === denominator) {
    return "1";
  }

  if (numerator > denominator) {
    const wholeNumber = Math.floor(numerator / denominator);
    const remainingNumerator = numerator % denominator;
    if (remainingNumerator === 0) {
      return wholeNumber.toString();
    }
    return (
      <>
        {wholeNumber} {formatFraction(remainingNumerator, denominator)}
      </>
    );
  }

  return formatFraction(numerator, denominator);
};

const IngredientRender = ({
  ingredient,
  ratio,
  isLast
}: {
  ingredient: partial_types.Ingredient;
  ratio: number;
  isLast?: boolean;
}) => {
  const amount = !!ingredient.amount && formatAmount(ingredient.amount * ratio);

  return (
    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
      <span className="font-medium">{ingredient.name}</span>
      <span className="text-gray-600 flex items-center">
        {amount} {ingredient.unit}
        {isLast && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
      </span>
    </div>
  );
};

const InstructionListRender = ({
  instructions,
}: {
  instructions: partial_types.Recipe["instructions"];
}) => {
  if (!instructions || instructions.length === 0) {
    return <p className="text-gray-500">No instructions found.</p>;
  }

  return (
    <ol className="space-y-4">
      {instructions.map((instruction, index) => {
        if (typeof instruction === "object") {
          return (
            instruction && (
              <li key={index}>
                <h3 className="font-semibold text-lg mb-2">
                  {instruction.title}
                </h3>
                <InstructionRender instruction={instruction.steps} />
              </li>
            )
          );
        }
        return (
          instruction && (
            <SingleStepRender key={index} step={instruction} index={index} />
          )
        );
      })}
    </ol>
  );
};

const InstructionRender = ({
  instruction,
}: {
  instruction: partial_types.PartSteps["steps"];
}) => {
  return (
    <ol className="list-decimal list-inside space-y-2">
      {instruction?.map(
        (step, index) =>
          step && <SingleStepRender key={index} step={step} index={index} />
      )}
    </ol>
  );
};

const SingleStepRender = ({ step, index }: { step: string; index: number }) => {
  return (
    <li className="text-gray-700">
      <span className="font-medium text-blue-800">Step {index + 1}:</span>{" "}
      {step}
    </li>
  );
};
