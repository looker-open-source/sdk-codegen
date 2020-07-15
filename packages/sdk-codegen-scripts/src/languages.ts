/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import config from 'config'
import {
  PythonGen,
  ICodeGen,
  ApiModel,
  IVersionInfo,
  SwiftGen,
  KotlinGen,
  TypescriptGen,
  CSharpGen,
} from '@looker/sdk-codegen'
import { quit } from './nodeUtils'

export interface IGeneratorSpec {
  /** name of language SDK to generate */
  language: string
  /** path name for legacy generator output. Defaults to language */
  path?: string
  /** code generator constructor */
  factory?: (api: ApiModel, versions?: IVersionInfo) => ICodeGen
  /** options for the legacy code generator */
  options?: string
  /** name of the legacy language generator */
  legacy?: string // legacy language tag
}

// To disable generation of any language specification, you can just comment it out
export const Languages: Array<IGeneratorSpec> = [
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new CSharpGen(api, versions),
    language: 'csharp',
    legacy: 'csharp',
    options: '-papiPackage=Looker -ppackageName=looker',
  },
  {
    factory: undefined,
    language: 'go',
    legacy: 'go',
    options: '-papiPackage=Looker -ppackageName=looker',
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new KotlinGen(api, versions),
    language: 'kotlin',
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new SwiftGen(api, versions),
    language: 'swift',
  },
  // {
  //   language: 'php',
  //   legacy: 'php',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  // },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new PythonGen(api, versions),
    language: 'python',
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new TypescriptGen(api, versions),
    language: 'typescript',
  },
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
  //   options: '-papiPackage=looker -ppackageName=looker'
  // },
]

/**
 * constructs a language generator by name
 *
 * CodeGenerator settings can be overridden by creating a config file and adding an entry for the desired language
 *
 * See the `config` folder in this package for more sample config files
 *
 * @param format name of language to generate
 * @param api API specification
 * @param versions version info to use for stamping the agentTag
 * @returns either an ICodeGen implementation or undefined
 */
export const getFormatter = (
  format: string,
  api: ApiModel,
  versions?: IVersionInfo
): ICodeGen | undefined => {
  format = format.toLocaleLowerCase()
  // Convenience alias
  if (format === 'c#') format = 'csharp'
  const generators = Languages.filter((x) => x.factory !== undefined)
  const language = generators.find(
    (item) => item.language.toLowerCase() === format.toLowerCase()
  )
  if (!language) {
    const langs = generators.map((item) => item.language)
    quit(
      `"${format}" is not a recognized language. Supported languages are: all, ${langs.join(
        ', '
      )}`
    )
  }
  if (language && language.factory) {
    const gen = language.factory(api, versions)
    if (config.has(format)) {
      const overrides = config.get<ICodeGen>(format)
      // Spread operator loses class functions
      // gen = { ...gen, ...overrides }
      Object.keys(overrides).forEach((key) => {
        if (key in gen) {
          gen[key] = overrides[key]
        }
      })
    }
    return gen
  }
  return undefined
}

export const legacyLanguages = (): Array<IGeneratorSpec> => {
  return Languages.filter((x) => !!x.legacy)
}
