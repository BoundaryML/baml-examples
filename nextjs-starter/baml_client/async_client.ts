/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
/* eslint-disable */
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
import { BamlRuntime, FunctionResult, BamlCtxManager, BamlStream, Image, ClientRegistry } from "@boundaryml/baml"
import {Answer, BookAnalysis, CharacterDescription, Citation, Context, Document, Education, Experience, Ingredient, Message, PartIngredient, PartSteps, Person, PopularityOverTime, Ranking, Recipe, Reply, Resume, Score, Spells, Tweet, WordCount, Category, ReplyType, Role} from "./types"
import TypeBuilder from "./type_builder"
import { DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME } from "./globals"

export type RecursivePartialNull<T> = T extends object
  ? {
      [P in keyof T]?: RecursivePartialNull<T[P]>;
    }
  : T | null;

export class BamlAsyncClient {
  private runtime: BamlRuntime
  private ctx_manager: BamlCtxManager
  private stream_client: BamlStreamClient

  constructor(runtime: BamlRuntime, ctx_manager: BamlCtxManager) {
    this.runtime = runtime
    this.ctx_manager = ctx_manager
    this.stream_client = new BamlStreamClient(runtime, ctx_manager)
  }

  get stream() {
    return this.stream_client
  }  

  
  async AnalyzeBooks(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<BookAnalysis> {
    const raw = await this.runtime.callFunction(
      "AnalyzeBooks",
      {
        "input": input
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as BookAnalysis
  }
  
  async AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Answer> {
    const raw = await this.runtime.callFunction(
      "AnswerQuestion",
      {
        "question": question,"context": context
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Answer
  }
  
  async ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Category[]> {
    const raw = await this.runtime.callFunction(
      "ClassifyMessage",
      {
        "convo": convo
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Category[]
  }
  
  async DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<CharacterDescription> {
    const raw = await this.runtime.callFunction(
      "DescribeCharacter",
      {
        "first_image": first_image
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as CharacterDescription
  }
  
  async ExtractPerson(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Person> {
    const raw = await this.runtime.callFunction(
      "ExtractPerson",
      {
        "input": input
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Person
  }
  
  async ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Resume> {
    const raw = await this.runtime.callFunction(
      "ExtractResume",
      {
        "raw_text": raw_text
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Resume
  }
  
  async ExtractResumeNoStructure(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<string> {
    const raw = await this.runtime.callFunction(
      "ExtractResumeNoStructure",
      {
        "raw_text": raw_text
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as string
  }
  
  async GenerateReplies(
      tweets: Tweet[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Reply[]> {
    const raw = await this.runtime.callFunction(
      "GenerateReplies",
      {
        "tweets": tweets
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Reply[]
  }
  
  async GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Recipe> {
    const raw = await this.runtime.callFunction(
      "GetRecipe",
      {
        "arg": arg
      },
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return raw.parsed() as Recipe
  }
  
}

class BamlStreamClient {
  constructor(private runtime: BamlRuntime, private ctx_manager: BamlCtxManager) {}

  
  AnalyzeBooks(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<BookAnalysis>, BookAnalysis> {
    const raw = this.runtime.streamFunction(
      "AnalyzeBooks",
      {
        "input": input
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<BookAnalysis>, BookAnalysis>(
      raw,
      (a): a is RecursivePartialNull<BookAnalysis> => a,
      (a): a is BookAnalysis => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Answer>, Answer> {
    const raw = this.runtime.streamFunction(
      "AnswerQuestion",
      {
        "question": question,"context": context
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Answer>, Answer>(
      raw,
      (a): a is RecursivePartialNull<Answer> => a,
      (a): a is Answer => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Category[]>, Category[]> {
    const raw = this.runtime.streamFunction(
      "ClassifyMessage",
      {
        "convo": convo
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Category[]>, Category[]>(
      raw,
      (a): a is RecursivePartialNull<Category[]> => a,
      (a): a is Category[] => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<CharacterDescription>, CharacterDescription> {
    const raw = this.runtime.streamFunction(
      "DescribeCharacter",
      {
        "first_image": first_image
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<CharacterDescription>, CharacterDescription>(
      raw,
      (a): a is RecursivePartialNull<CharacterDescription> => a,
      (a): a is CharacterDescription => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ExtractPerson(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Person>, Person> {
    const raw = this.runtime.streamFunction(
      "ExtractPerson",
      {
        "input": input
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Person>, Person>(
      raw,
      (a): a is RecursivePartialNull<Person> => a,
      (a): a is Person => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Resume>, Resume> {
    const raw = this.runtime.streamFunction(
      "ExtractResume",
      {
        "raw_text": raw_text
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Resume>, Resume>(
      raw,
      (a): a is RecursivePartialNull<Resume> => a,
      (a): a is Resume => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  ExtractResumeNoStructure(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<string>, string> {
    const raw = this.runtime.streamFunction(
      "ExtractResumeNoStructure",
      {
        "raw_text": raw_text
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<string>, string>(
      raw,
      (a): a is RecursivePartialNull<string> => a,
      (a): a is string => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  GenerateReplies(
      tweets: Tweet[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Reply[]>, Reply[]> {
    const raw = this.runtime.streamFunction(
      "GenerateReplies",
      {
        "tweets": tweets
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Reply[]>, Reply[]>(
      raw,
      (a): a is RecursivePartialNull<Reply[]> => a,
      (a): a is Reply[] => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
  GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<RecursivePartialNull<Recipe>, Recipe> {
    const raw = this.runtime.streamFunction(
      "GetRecipe",
      {
        "arg": arg
      },
      undefined,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
      __baml_options__?.clientRegistry,
    )
    return new BamlStream<RecursivePartialNull<Recipe>, Recipe>(
      raw,
      (a): a is RecursivePartialNull<Recipe> => a,
      (a): a is Recipe => a,
      this.ctx_manager.cloneContext(),
      __baml_options__?.tb?.__tb(),
    )
  }
  
}

export const b = new BamlAsyncClient(DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX)