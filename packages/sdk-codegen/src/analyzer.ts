/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { IApiModel, IType } from './sdkModels'
import { titleCase, WriteType } from './sdkModels'

/** Foreign key naming convention. Could be modified for other naming conventions */
const FKPattern = /^(\w*)_id$/i

/**
 * find all related id properties from a type based on FKPattern
 *
 * @param type to analyze
 */
export const relatedIds = (type: IType) => {
  const result = []
  for (const key in type.properties) {
    if (FKPattern.test(key)) {
      result.push(key)
    }
  }
  return result
}

/**
 * Return the type only if it is a custom type from the API spec
 *
 * Types that are simple (intrinsic) or WriteType are not returned
 *
 * @param api containing type definitions
 * @param name type name to find
 */
const typeDef = (api: IApiModel, name: string): IType | undefined => {
  if (name in api.types) {
    const type = api.types[name]
    if (!(type.intrinsic || type instanceof WriteType)) {
      return type
    }
  }
  return undefined
}

/**
 * Find a type definition from the name of a property based on FKPattern
 * @param api containing types
 * @param id name to find
 */
export const typeFromId = (api: IApiModel, id: string) => {
  const group = id.match(FKPattern)
  if (group) {
    return typeDef(api, titleCase(group[1]))
  }
  return undefined
}

/**
 * find all types related to the specified type
 *
 * Returns the union of complex types referenced in the object and types referenced by FK convention
 *
 * @param api containing types
 * @param type to relate to other types
 */
export const relatedTypes = (api: IApiModel, type: IType) => {
  const result: IType[] = []
  const ids = relatedIds(type)
  ids.forEach((id) => {
    const entity = typeFromId(api, id)
    if (entity) {
      result.push(entity)
    }
  })
  Object(Array.from(type.customTypes)).forEach((t: string) => {
    const entity = typeDef(api, t)
    if (entity) {
      result.push(entity)
    }
  })
  return result
}

export interface ITypeMap {
  /** Name of type */
  [key: string]: ITypeMap
}

/**
 * Get all relations for a type, avoiding recursion
 *
 * TODO get bread-first population working rather than the depth first with a duplication
 * bug for the first key in each collection
 *
 * @param api containing types
 * @param type to relate
 * @param seen set of type names already encountered to avoid infinit recursion
 */
export const relations = (
  api: IApiModel,
  type: IType,
  seen: Set<string> = new Set<string>()
) => {
  const parent = type.jsonName
  if (!seen) {
    seen = new Set<string>()
  }
  if (seen.has(parent)) {
    return {} // avoid infinite recursion
  }
  seen.add(parent)
  const kin = relatedTypes(api, type)
  const family = {}
  kin.forEach((k) => {
    family[k.jsonName] = {}
  })
  kin.forEach((k) => {
    const name = k.jsonName
    if (!seen.has(name)) {
      family[name] = relations(api, k, seen)
    }
  })
  const result: ITypeMap = {}
  result[parent] = family
  return result
}
