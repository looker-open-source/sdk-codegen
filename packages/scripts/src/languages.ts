/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { PythonGen,
ICodeGen, ApiModel, IVersionInfo, SwiftGen, KotlinGen,
TypescriptGen } from '@looker/sdk-codegen'
import { quit } from './nodeUtils'

export interface IGeneratorSpec {
  language: string // name of Open API Generator language to produce
  path?: string
  factory?: (api: ApiModel, versions?: IVersionInfo) => ICodeGen
  options?: string // generator options
  legacy?: string // legacy language tag
}

// To disable generation of any language specification, you can just comment it out
export const Languages: Array<IGeneratorSpec> = [
  {
    language: 'csharp',
    legacy: 'csharp',
    factory: undefined,
    options: '-papiPackage=Looker -ppackageName=looker'
  },
  {
    language: 'go',
    legacy: 'go',
    factory: undefined,
    options: '-papiPackage=Looker -ppackageName=looker'
  },
  {
    language: 'kotlin',
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new KotlinGen(api, versions)
  },
  {
    language: 'swift',
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new SwiftGen(api, versions)
  },
  // {
  //   language: 'php',
  //   legacy: 'php',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  {
    language: 'python',
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new PythonGen(api, versions)
  },
  {
    language: 'typescript',
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new TypescriptGen(api, versions)
  }
  // {
  //   language: 'r',
  //   legacy: 'r'
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  // {
  //   language: 'ruby',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  // {
  //   language: 'rust',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  // {
  //   language: 'typescript-node',
  //   path: 'ts_node',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  // {
  //   language: 'typescript-fetch',
  //   path: 'ts_fetch',
  //   options: '-papiPackage=looker -ppackageName=looker'
  // },
]

export const getFormatter = (
  format: string,
  api: ApiModel,
  versions?: IVersionInfo
): ICodeGen | undefined => {
  const generators = Languages.filter(x => x.factory !== undefined)
  const language = generators.find(
    item => item.language.toLowerCase() === format.toLowerCase()
  )
  if (!language) {
    const langs = generators.map(item => item.language)
    quit(
      `"${format}" is not a recognized language. Supported languages are: all, ${langs.join(
        ', '
      )}`
    )
  }
  if (language && language.factory) {
    return language.factory(api, versions)
  }
  return undefined
}

export const legacyLanguages = (): Array<IGeneratorSpec> => {
  return Languages.filter(x => !!x.legacy)
}
