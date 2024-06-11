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
import { FieldType } from '@boundaryml/baml/native'
import { TypeBuilder as _TypeBuilder, EnumBuilder, ClassBuilder } from '@boundaryml/baml/type_builder'

export default class TypeBuilder {
    private tb: _TypeBuilder;
    
    

    constructor() {
        this.tb = new _TypeBuilder({
          classes: new Set([
            "Answer","BookAnalysis","CharacterDescription","Citation","Context","Document","Education","Ingredient","Message","PartIngredient","PartSteps","PopularityOverTime","Ranking","Recipe","Resume","Score","Spells","WordCount",
          ]),
          enums: new Set([
            "Category","Role",
          ])
        });
        
        
    }

    __tb() {
      return this.tb._tb();
    }
    
    string(): FieldType {
        return this.tb.string()
    }

    int(): FieldType {
        return this.tb.int()
    }

    float(): FieldType {
        return this.tb.float()
    }

    bool(): FieldType {
        return this.tb.bool()
    }

    list(type: FieldType): FieldType {
        return this.tb.list(type)
    }

    addClass<Name extends string>(name: Name): ClassBuilder<Name> {
        this.tb.addClass(name);
    }

    addEnum<Name extends string>(name: Name): EnumBuilder<Name> {
        this.tb.addEnum(name);
    }
}