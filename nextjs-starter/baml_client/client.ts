/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
/* eslint-disable */
import { BamlRuntime, FunctionResult, BamlCtxManager, BamlStream, Image } from "@boundaryml/baml"
import {Answer, BookAnalysis, CharacterDescription, Citation, Context, Document, Education, Ingredient, Message, PartIngredient, PartSteps, PopularityOverTime, Ranking, Recipe, Resume, Score, Spells, WordCount, Category, Role} from "./types"
import TypeBuilder from "./type_builder"

export class BamlClient {
  private stream_client: BamlStreamClient

  constructor(private runtime: BamlRuntime, private ctx_manager: BamlCtxManager) {
    this.stream_client = new BamlStreamClient(runtime, ctx_manager)
  }

  get stream() {
    return this.stream_client
  }  

  
  async AnalyzeBooks(
      input: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<BookAnalysis> {
    const raw = await this.runtime.callFunction(
      "AnalyzeBooks",
      {
        "input": input
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as BookAnalysis
  }
  
  async AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<Answer> {
    const raw = await this.runtime.callFunction(
      "AnswerQuestion",
      {
        "question": question,"context": context
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as Answer
  }
  
  async ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<Category[]> {
    const raw = await this.runtime.callFunction(
      "ClassifyMessage",
      {
        "convo": convo
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as Category[]
  }
  
  async DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<CharacterDescription> {
    const raw = await this.runtime.callFunction(
      "DescribeCharacter",
      {
        "first_image": first_image
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as CharacterDescription
  }
  
  async ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<Resume> {
    const raw = await this.runtime.callFunction(
      "ExtractResume",
      {
        "raw_text": raw_text
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as Resume
  }
  
  async GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): Promise<Recipe> {
    const raw = await this.runtime.callFunction(
      "GetRecipe",
      {
        "arg": arg
      },
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return raw.parsed() as Recipe
  }
  
}

class BamlStreamClient {
  constructor(private runtime: BamlRuntime, private ctx_manager: BamlCtxManager) {}

  
  AnalyzeBooks(
      input: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Partial<BookAnalysis> | null), BookAnalysis> {
    const raw = this.runtime.streamFunction(
      "AnalyzeBooks",
      {
        "input": input
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Partial<BookAnalysis> | null), BookAnalysis>(
      raw,
      (a): a is (Partial<BookAnalysis> | null) => a,
      (a): a is BookAnalysis => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Partial<Answer> | null), Answer> {
    const raw = this.runtime.streamFunction(
      "AnswerQuestion",
      {
        "question": question,"context": context
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Partial<Answer> | null), Answer>(
      raw,
      (a): a is (Partial<Answer> | null) => a,
      (a): a is Answer => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Category | null)[], Category[]> {
    const raw = this.runtime.streamFunction(
      "ClassifyMessage",
      {
        "convo": convo
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Category | null)[], Category[]>(
      raw,
      (a): a is (Category | null)[] => a,
      (a): a is Category[] => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Partial<CharacterDescription> | null), CharacterDescription> {
    const raw = this.runtime.streamFunction(
      "DescribeCharacter",
      {
        "first_image": first_image
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Partial<CharacterDescription> | null), CharacterDescription>(
      raw,
      (a): a is (Partial<CharacterDescription> | null) => a,
      (a): a is CharacterDescription => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Partial<Resume> | null), Resume> {
    const raw = this.runtime.streamFunction(
      "ExtractResume",
      {
        "raw_text": raw_text
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Partial<Resume> | null), Resume>(
      raw,
      (a): a is (Partial<Resume> | null) => a,
      (a): a is Resume => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder }
  ): BamlStream<(Partial<Recipe> | null), Recipe> {
    const raw = this.runtime.streamFunction(
      "GetRecipe",
      {
        "arg": arg
      },
      undefined,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
    return new BamlStream<(Partial<Recipe> | null), Recipe>(
      raw,
      (a): a is (Partial<Recipe> | null) => a,
      (a): a is Recipe => a,
      this.ctx_manager.get(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
}