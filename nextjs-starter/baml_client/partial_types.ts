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

import * as types from "./types"

/******************************************************************************
*
*  These types are used for streaming, for when an instance of a type
*  is still being built up and any of its fields is not yet fully available.
*
******************************************************************************/

export interface StreamState<T> {
    value: T
    state: "Pending" | "Incomplete" | "Complete"
}

export namespace partial_types {
    
    export interface Answer {
        answersInText?: (partial_types.Citation | null)[]
        answer?: (string | null)
    }
    
    export interface BookAnalysis {
        bookNames?: (string | null)[]
        popularityOverTime?: (partial_types.PopularityOverTime | null)[]
        popularityRankings?: (partial_types.Ranking | null)[]
        wordCounts?: (partial_types.WordCount | null)[]
    }
    
    export interface CharacterDescription {
        name?: (string | null)
        clothingItems?: (string | null)[]
        hairColor: ((string | null) | null)
        smellDescription?: (string | null)
        spells?: (partial_types.Spells | null)[]
    }
    
    export interface Citation {
        number?: (number | null)
        documentTitle?: (string | null)
        sourceLink?: (string | null)
        relevantTextFromDocument?: (string | null)
    }
    
    export interface ClassWithBlockDone {
        i_16_digits?: (number | null)
        s_20_words?: (string | null)
    }
    
    export interface ClassWithoutDone {
        i_16_digits?: (number | null)
        s_20_words?: StreamState<(string | null)>
    }
    
    export interface Context {
        documents?: (partial_types.Document | null)[]
    }
    
    export interface Document {
        title?: (string | null)
        text?: (string | null)
        link?: (string | null)
    }
    
    export interface Education {
        school?: (string | null)
        degree?: (string | null)
        year?: (number | null)
    }
    
    export interface Experience {
        company?: (string | null)
        title: ((string | null) | null)
        start_date?: (string | null)
        end_date: ((string | null) | null)
        description?: (string | null)[]
        company_url: ((string | null) | null)
    }
    
    export interface Guide {
        related_topics?: (partial_types.Query | null)[]
        processing_instructions?: (string | null)[]
        packaging_instructions?: (string | null)[]
    }
    
    export interface Ingredient {
        name?: (string | null)
        amount?: (number | null)
        unit?: (string | null)
        description: ((string | null) | null)
    }
    
    export interface Link {
        url?: Checked<(string | null),"valid_link">
    }
    
    export interface Message {
        role?: (Role | null)
        content?: (string | null)
    }
    
    export interface PartIngredient {
        title?: (string | null)
        ingredients?: (partial_types.Ingredient | null)[]
    }
    
    export interface PartSteps {
        title?: (string | null)
        steps?: (string | null)[]
    }
    
    export interface Person {
        [key: string]: any;
    }
    
    export interface PopularityOverTime {
        bookName?: (string | null)
        scores?: (partial_types.Score | null)[]
    }
    
    export interface Query {
        category?: ("processing" | "packaging" | null)
        phrase?: (string | null)
    }
    
    export interface Ranking {
        bookName?: (string | null)
        score?: (number | null)
    }
    
    export interface Recipe {
        topic?: ("food" | "other" | null)
        number_of_servings?: (number | null)
        ingredients?: ((partial_types.PartIngredient | null)[] | (partial_types.Ingredient | null)[] | null)
        instructions?: ((partial_types.PartSteps | null)[] | (string | null)[] | null)
        serving_tips?: (string | null)[]
    }
    
    export interface Reply {
        reply_text?: (string | null)
        reply_type?: (ReplyType | null)
    }
    
    export interface Resume {
        name?: (string | null)
        links?: (partial_types.Link | null)[]
        education?: (partial_types.Education | null)[]
        experience?: (partial_types.Experience | null)[]
        skills?: (string | null)[]
        why_hire?: (string | null)[]
    }
    
    export interface Score {
        year?: (number | null)
        score?: (number | null)
    }
    
    export interface SemanticContainer {
        sixteen_digit_number?: (number | null)
        string_with_twenty_words: string
        class_1?: (partial_types.ClassWithoutDone | null)
        class_2: types.ClassWithBlockDone
        class_done_needed: types.ClassWithBlockDone
        class_needed: partial_types.ClassWithoutDone
        three_small_things?: (partial_types.SmallThing | null)[]
        final_string?: (string | null)
    }
    
    export interface SmallThing {
        i_16_digits: number
        i_8_digits?: (number | null)
    }
    
    export interface Spells {
        name?: (string | null)
        description?: (string | null)
    }
    
    export interface Tweet {
        user?: (string | null)
        text?: (string | null)
    }
    
    export interface Van {
        front?: ((partial_types.Visibility | null) | false | null)
        back?: ((partial_types.Visibility | null) | false | null)
        driver_side?: ((partial_types.Visibility | null) | false | null)
        passenger_side?: ((partial_types.Visibility | null) | false | null)
    }
    
    export interface VanSideAnalysis {
        visibility?: (partial_types.Van | null)
        confidence?: ("high" | "medium" | "low" | null)
    }
    
    export interface VehicleSideResponse {
        full_vehicle_side_visible?: (boolean | null)
        vehicle_side: ((VehicleSide | null) | null)
    }
    
    export interface Visibility {
        view?: ("partial" | "full" | null)
    }
    
    export interface WordCount {
        bookName?: (string | null)
        count?: (number | null)
    }
    
}