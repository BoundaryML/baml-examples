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
import { type BamlCtxManager, type BamlRuntime, BamlStream, BamlValidationError, type ClientRegistry, FunctionResult, type Image, createBamlValidationError } from "@boundaryml/baml"
import type { Checked, Check, RecursivePartialNull as MovedRecursivePartialNull } from "./types"
import type { partial_types } from "./partial_types";
import type {Answer, BookAnalysis, CharacterDescription, Citation, ClassWithBlockDone, ClassWithoutDone, Context, Document, Education, Experience, Guide, Ingredient, Link, Message, PartIngredient, PartSteps, Person, PopularityOverTime, Query, Ranking, Recipe, Reply, Resume, Score, SemanticContainer, SmallThing, Spells, Tweet, Van, VanSideAnalysis, VehicleSideResponse, Visibility, WordCount, Category, ReplyType, Role, VehicleSide} from "./types"
import type TypeBuilder from "./type_builder"
import { DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME } from "./globals"

/**
 * @deprecated Use RecursivePartialNull from 'baml_client/types' instead.
 */
export type RecursivePartialNull<T> = MovedRecursivePartialNull<T>

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
    try {
      const raw = await this.runtime.callFunction(
        "AnalyzeBooks",
        {
          "input": input
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as BookAnalysis
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async AnalyzeVanSide(
      vanImage: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<VanSideAnalysis> {
    try {
      const raw = await this.runtime.callFunction(
        "AnalyzeVanSide",
        {
          "vanImage": vanImage
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as VanSideAnalysis
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Answer> {
    try {
      const raw = await this.runtime.callFunction(
        "AnswerQuestion",
        {
          "question": question,"context": context
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Answer
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Category[]> {
    try {
      const raw = await this.runtime.callFunction(
        "ClassifyMessage",
        {
          "convo": convo
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Category[]
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<CharacterDescription> {
    try {
      const raw = await this.runtime.callFunction(
        "DescribeCharacter",
        {
          "first_image": first_image
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as CharacterDescription
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async ExtractPerson(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Person> {
    try {
      const raw = await this.runtime.callFunction(
        "ExtractPerson",
        {
          "input": input
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Person
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Resume> {
    try {
      const raw = await this.runtime.callFunction(
        "ExtractResume",
        {
          "raw_text": raw_text
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Resume
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async ExtractResumeNoStructure(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<string> {
    try {
      const raw = await this.runtime.callFunction(
        "ExtractResumeNoStructure",
        {
          "raw_text": raw_text
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as string
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async GenerateGuide(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Guide> {
    try {
      const raw = await this.runtime.callFunction(
        "GenerateGuide",
        {
          "arg": arg
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Guide
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async GenerateReplies(
      tweets: Tweet[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Reply[]> {
    try {
      const raw = await this.runtime.callFunction(
        "GenerateReplies",
        {
          "tweets": tweets
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Reply[]
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<Recipe> {
    try {
      const raw = await this.runtime.callFunction(
        "GetRecipe",
        {
          "arg": arg
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as Recipe
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async IdentifyVehicleSide(
      vanImage: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<VehicleSideResponse> {
    try {
      const raw = await this.runtime.callFunction(
        "IdentifyVehicleSide",
        {
          "vanImage": vanImage
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as VehicleSideResponse
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async IsResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<boolean> {
    try {
      const raw = await this.runtime.callFunction(
        "IsResume",
        {
          "raw_text": raw_text
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as boolean
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
  async MakeSemanticContainer(
      
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): Promise<SemanticContainer> {
    try {
      const raw = await this.runtime.callFunction(
        "MakeSemanticContainer",
        {
          
        },
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return raw.parsed(false) as SemanticContainer
    } catch (error: any) {
      const bamlError = createBamlValidationError(error);
      if (bamlError instanceof BamlValidationError) {
        throw bamlError;
      }

      throw error;
    }
  }
  
}

class BamlStreamClient {
  constructor(private runtime: BamlRuntime, private ctx_manager: BamlCtxManager) {}

  
  AnalyzeBooks(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.BookAnalysis, BookAnalysis> {
    try {
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
      return new BamlStream<partial_types.BookAnalysis, BookAnalysis>(
        raw,
        (a): a is partial_types.BookAnalysis => a,
        (a): a is BookAnalysis => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  AnalyzeVanSide(
      vanImage: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.VanSideAnalysis, VanSideAnalysis> {
    try {
      const raw = this.runtime.streamFunction(
        "AnalyzeVanSide",
        {
          "vanImage": vanImage
        },
        undefined,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return new BamlStream<partial_types.VanSideAnalysis, VanSideAnalysis>(
        raw,
        (a): a is partial_types.VanSideAnalysis => a,
        (a): a is VanSideAnalysis => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  AnswerQuestion(
      question: string,context: Context,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.Answer, Answer> {
    try {
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
      return new BamlStream<partial_types.Answer, Answer>(
        raw,
        (a): a is partial_types.Answer => a,
        (a): a is Answer => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  ClassifyMessage(
      convo: Message[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<(Category | null)[], Category[]> {
    try {
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
      return new BamlStream<(Category | null)[], Category[]>(
        raw,
        (a): a is (Category | null)[] => a,
        (a): a is Category[] => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  DescribeCharacter(
      first_image: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.CharacterDescription, CharacterDescription> {
    try {
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
      return new BamlStream<partial_types.CharacterDescription, CharacterDescription>(
        raw,
        (a): a is partial_types.CharacterDescription => a,
        (a): a is CharacterDescription => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  ExtractPerson(
      input: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.Person, Person> {
    try {
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
      return new BamlStream<partial_types.Person, Person>(
        raw,
        (a): a is partial_types.Person => a,
        (a): a is Person => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  ExtractResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.Resume, Resume> {
    try {
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
      return new BamlStream<partial_types.Resume, Resume>(
        raw,
        (a): a is partial_types.Resume => a,
        (a): a is Resume => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  ExtractResumeNoStructure(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<string, string> {
    try {
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
      return new BamlStream<string, string>(
        raw,
        (a): a is string => a,
        (a): a is string => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  GenerateGuide(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.Guide, Guide> {
    try {
      const raw = this.runtime.streamFunction(
        "GenerateGuide",
        {
          "arg": arg
        },
        undefined,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return new BamlStream<partial_types.Guide, Guide>(
        raw,
        (a): a is partial_types.Guide => a,
        (a): a is Guide => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  GenerateReplies(
      tweets: Tweet[],
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<(partial_types.Reply | null)[], Reply[]> {
    try {
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
      return new BamlStream<(partial_types.Reply | null)[], Reply[]>(
        raw,
        (a): a is (partial_types.Reply | null)[] => a,
        (a): a is Reply[] => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  GetRecipe(
      arg: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.Recipe, Recipe> {
    try {
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
      return new BamlStream<partial_types.Recipe, Recipe>(
        raw,
        (a): a is partial_types.Recipe => a,
        (a): a is Recipe => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  IdentifyVehicleSide(
      vanImage: Image,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.VehicleSideResponse, VehicleSideResponse> {
    try {
      const raw = this.runtime.streamFunction(
        "IdentifyVehicleSide",
        {
          "vanImage": vanImage
        },
        undefined,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return new BamlStream<partial_types.VehicleSideResponse, VehicleSideResponse>(
        raw,
        (a): a is partial_types.VehicleSideResponse => a,
        (a): a is VehicleSideResponse => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  IsResume(
      raw_text: string,
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<boolean, boolean> {
    try {
      const raw = this.runtime.streamFunction(
        "IsResume",
        {
          "raw_text": raw_text
        },
        undefined,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return new BamlStream<boolean, boolean>(
        raw,
        (a): a is boolean => a,
        (a): a is boolean => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
  MakeSemanticContainer(
      
      __baml_options__?: { tb?: TypeBuilder, clientRegistry?: ClientRegistry }
  ): BamlStream<partial_types.SemanticContainer, SemanticContainer> {
    try {
      const raw = this.runtime.streamFunction(
        "MakeSemanticContainer",
        {
          
        },
        undefined,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
      )
      return new BamlStream<partial_types.SemanticContainer, SemanticContainer>(
        raw,
        (a): a is partial_types.SemanticContainer => a,
        (a): a is SemanticContainer => a,
        this.ctx_manager.cloneContext(),
        __baml_options__?.tb?.__tb(),
      )
    } catch (error) {
      if (error instanceof Error) {
        const bamlError = createBamlValidationError(error);
        if (bamlError instanceof BamlValidationError) {
          throw bamlError;
        }
      }
      throw error;
    }
  }
  
}

export const b = new BamlAsyncClient(DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_RUNTIME, DO_NOT_USE_DIRECTLY_UNLESS_YOU_KNOW_WHAT_YOURE_DOING_CTX)