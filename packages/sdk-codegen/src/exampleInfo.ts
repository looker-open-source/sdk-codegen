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

import { KeyedCollection } from './sdkModels'

export interface ISDKCall {
  /** SDK variable name for the call found */
  sdk: string

  /** Name of the method/operationId */
  operationId: string

  /** Source code line number */
  line: number

  /** Source code column number where method name was found */
  column: number
}

export interface IExampleLink {
  /** Either summary from .md documentation or the name of the source file */
  description: string
  /** permalink to file and line number */
  permalink: string
  /** text to show on hover */
  tooltip: string
}

export type SDKCalls = ISDKCall[]

export interface ISummary {
  /** relative file name */
  sourceFile: string
  /** summary extracted from md, rst, or other doc file */
  summary: string
}

export type Summaries = KeyedCollection<ISummary>

export interface IFileCall {
  /** relative file name */
  sourceFile: string
  /** line number for source code call */
  line: number
  /** Optional column number for source code call. Maybe we don't need this datum */
  column?: number
}

/**
 { "me": {
  ".ts": {
    [
      {
        "hash": "TODO",
        "sourceFile": "foo.ts",
        "line": 1,
        "column": 5,
      }
    ]
    }
  }
}
 */

export type FileCalls = IFileCall[]

export type LanguageCalls = KeyedCollection<FileCalls>

export interface INugget {
  operationId: string
  calls: LanguageCalls
}

export type Nuggets = KeyedCollection<INugget>

/** All mined example data */
export interface IMine {
  commitHash: string
  remoteOrigin: string
  summaries: Summaries
  nuggets: Nuggets
}

/**
 * Create a permalink for a github file with line number
 * @param remote https url for repository
 * @param hash commit hash
 * @param fileName name of file
 * @param line line number in file
 */
export const permaLink = (
  // https://github.com/looker-open-source/sdk-codegen/blob/bfca52d2c8ba85018f76548158fd1dd90aa1f64a/examples/typescript/customConfigReader.ts#L53
  remote: string,
  hash: string,
  fileName: string,
  line: number
) => `${remote}/blob/${hash}/${fileName}#L${line}`

/**
 * Gets the summary for an example file, or defaults to the file and line number
 * @param lode all mined example data
 * @param call specific call to summarize
 */
export const summarize = (lode: IMine, call: IFileCall): string => {
  if (call.sourceFile in lode.summaries) {
    return lode.summaries[call.sourceFile].summary
  }
  // Default to file name if no summary is found
  return call.sourceFile
}

/**
 * Provides permalink and description for an example file call
 * @param lode all mined example data
 * @param call specific all to link
 */
export const exampleLink = (lode: IMine, call: IFileCall): IExampleLink => {
  return {
    permalink: permaLink(
      lode.remoteOrigin,
      lode.commitHash,
      call.sourceFile,
      call.line
    ),
    description: summarize(lode, call),
    tooltip: `${call.sourceFile} line ${call.line}`,
  }
}

/** map file extension to language name */
export const extensionToLanguage = {
  '.py': 'Python',
  '.ts': 'Typescript',
  '.tsx': 'Typescript',
  '.cs': 'C#',
  '.kt': 'Kotlin',
  '.swift': 'Swift',
  '.rb': 'Ruby',
  '.dart': 'Dart',
  '.go': 'Go',
  '.md': 'Markdown',
}

/**
 * Return the recognized file extensions for the requested language
 * @param language
 */
export const getLanguageExtensions = (language: string): string[] => {
  switch (language.toLowerCase()) {
    case 'ts':
    case 'typescript':
      return ['.ts', 'tsx']
    case 'csharp':
    case 'c#':
      return ['.cs']
    case 'ruby':
      return ['.rb']
    case 'python':
      return ['.py']
    case 'swift':
      return ['.swift']
    case 'kotlin':
      return ['.kt']
    case 'dart':
      return ['.dart']
    case 'go':
      return ['.go']
    default:
      return []
  }
}

export const findExampleLanguages = (lode: IMine, methodName: string) => {
  const all = lode.nuggets[methodName]
  if (!all) return []
  const result = new Set<string>()
  const keys = Object.keys(extensionToLanguage)
  keys.forEach((key) => {
    if (all.calls[key]) result.add(extensionToLanguage[key])
  })
  return Array.from(result)
}

/**
 * Searches for examples containing operationId usages in the given language
 * @param lode All example data
 * @param language Language example should be in
 * @param operationId Method's operationId to search for
 */
export const findExamples = (
  lode: IMine,
  language: string,
  operationId: string
): IExampleLink[] => {
  const all = lode.nuggets[operationId]
  const exts = getLanguageExtensions(language)
  const links: IExampleLink[] = []

  if (all && exts.length > 0) {
    exts.forEach((ext) => {
      const calls = all.calls[ext]
      if (calls) {
        calls.forEach((call: IFileCall) => {
          const link = exampleLink(lode, call)
          if (link) {
            links.push(exampleLink(lode, call))
          }
        })
      }
    })
  }
  return links.sort((a, b) => a.permalink.localeCompare(b.permalink))
}
