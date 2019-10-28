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

import { PythonGen } from './python.gen'
import { ICodeGen, ApiModel } from './sdkModels'
import { TypescriptGen } from './typescript.gen'
import { quit } from './utils'
import { IVersionInfo } from './codeGen'
import { SwiftGen } from './swift.gen'

export interface IGeneratorSpec {
  language: string // name of Open API Generator language to produce
  path?: string
  factory: (api: ApiModel, versions?: IVersionInfo) => ICodeGen
  options: string // generator options
  legacy?: string // legacy language tag
}

// To disable generation of any language specification, you can just comment it out
export const Languages: Array<IGeneratorSpec> =
  [
    // {
    //   language: 'csharp',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'kotlin',
    //   options: '-DapiPackage=com.looker.sdk -DpackageName=com.looker.sdk'
    // },
    // TODO figure out why legacy swift aborts with an error and none of the other languages do
    { language: 'swift',
      legacy: 'swift4',
      factory: (api: ApiModel, versions?: IVersionInfo) => new SwiftGen(api, versions),
      options: '-DapiPackage=Looker -DpackageName=looker'
    },
    // {
    //   language: 'swift4',
    //   path: 'swift',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'php',
    //   path: 'php',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    {
      language: 'python',
      factory: (api: ApiModel, versions?: IVersionInfo) => new PythonGen(api, versions),
      options: '-DapiPackage=Looker -DpackageName=looker'
    },
    {
      language: 'typescript',
      legacy: 'typescript-node', // OpenAPI generate uses this for the language
      factory: (api: ApiModel, versions?: IVersionInfo) => new TypescriptGen(api, versions),
      options: '-DapiPackage=Looker -DpackageName=looker'
    },
    // {
    //   language: 'r',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'ruby',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'rust',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'typescript-node',
    //   path: 'ts_node',
    //   options: '-DapiPackage=Looker -DpackageName=looker'
    // },
    // {
    //   language: 'typescript-fetch',
    //   path: 'ts_fetch',
    //   options: '-DapiPackage=looker -DpackageName=looker'
    // },
  ]

export const getFormatter = (format: string, api: ApiModel, versions?: IVersionInfo): ICodeGen => {
  const language = Languages.find((item) => item.language.toLowerCase() === format.toLowerCase())
  if (!language) {
    const langs = Languages.map((item) => item.language)
    quit(`"${format}" is not a recognized language. Supported languages are: all, ${langs.join(', ')}`)
  }
  return language!.factory(api, versions)
}
