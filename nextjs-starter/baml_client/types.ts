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
import { Image } from "@boundaryml/baml"

export type RecursivePartialNull<T> = T extends object
  ? {
      [P in keyof T]?: RecursivePartialNull<T[P]>;
    }
  : T | null;

export interface Checked<T,CheckName extends string = string> {
    value: T,
    checks: Record<CheckName, Check>,
}

export interface Check {
    name: string,
    expr: string
    status: "succeeded" | "failed"
}

export function all_succeeded<CheckName extends string>(checks: Record<CheckName, Check>): boolean {
    return get_checks(checks).every(check => check.status === "succeeded")
}

export function get_checks<CheckName extends string>(checks: Record<CheckName, Check>): Check[] {
    return Object.values(checks)
}
export enum Category {
  Refund = "Refund",
  CancelOrder = "CancelOrder",
  TechnicalSupport = "TechnicalSupport",
  AccountIssue = "AccountIssue",
  Question = "Question",
}

export enum ReplyType {
  HUMOROUS = "HUMOROUS",
  SARCASTIC = "SARCASTIC",
  CURIOUS = "CURIOUS",
  INTELLECTUAL = "INTELLECTUAL",
}

export enum Role {
  Customer = "Customer",
  Assistant = "Assistant",
}

export enum VehicleSide {
  Front = "Front",
  Left = "Left",
  Right = "Right",
  Back = "Back",
}

export interface Answer {
  answersInText: Citation[]
  answer: string
  
}

export interface BookAnalysis {
  bookNames: string[]
  popularityOverTime: PopularityOverTime[]
  popularityRankings: Ranking[]
  wordCounts: WordCount[]
  
}

export interface CharacterDescription {
  name: string
  clothingItems: string[]
  hairColor?: string | null
  smellDescription: string
  spells: Spells[]
  
}

export interface Citation {
  number: number
  documentTitle: string
  sourceLink: string
  relevantTextFromDocument: string
  
}

export interface Context {
  documents: Document[]
  
}

export interface Document {
  title: string
  text: string
  link: string
  
}

export interface Education {
  school: string
  degree: string
  year: number
  
}

export interface Experience {
  company: string
  title?: string | null
  start_date: string
  end_date?: string | null
  description: string[]
  company_url?: string | null
  
}

export interface Guide {
  related_topics: Query[]
  processing_instructions: string[]
  packaging_instructions: string[]
  
}

export interface Ingredient {
  name: string
  amount: number
  unit: string
  description?: string | null
  
}

export interface Link {
  url: Checked<string,"valid_link">
  
}

export interface Message {
  role: Role
  content: string
  
}

export interface PartIngredient {
  title: string
  ingredients: Ingredient[]
  
}

export interface PartSteps {
  title: string
  steps: string[]
  
}

export interface Person {
  
  [key: string]: any;
}

export interface PopularityOverTime {
  bookName: string
  scores: Score[]
  
}

export interface Query {
  category: "processing" | "packaging"
  phrase: string
  
}

export interface Ranking {
  bookName: string
  score: number
  
}

export interface Recipe {
  topic: "food" | "other"
  number_of_servings: number
  ingredients: PartIngredient[] | Ingredient[]
  instructions: PartSteps[] | string[]
  serving_tips: string[]
  
}

export interface Reply {
  reply_text: string
  reply_type: ReplyType
  
}

export interface Resume {
  name: string
  links: Link[]
  education: Education[]
  experience: Experience[]
  skills: string[]
  why_hire: string[]
  
}

export interface Score {
  year: number
  score: number
  
}

export interface Spells {
  name: string
  description: string
  
}

export interface Tweet {
  user: string
  text: string
  
}

export interface Van {
  front: Visibility | false
  back: Visibility | false
  driver_side: Visibility | false
  passenger_side: Visibility | false
  
}

export interface VanSideAnalysis {
  visibility: Van
  confidence: "high" | "medium" | "low"
  
}

export interface VehicleSideResponse {
  full_vehicle_side_visible: boolean
  vehicle_side?: VehicleSide | null
  
}

export interface Visibility {
  view: "partial" | "full"
  
}

export interface WordCount {
  bookName: string
  count: number
  
}
