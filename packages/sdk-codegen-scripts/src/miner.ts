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

import * as fs from 'fs'
import path from 'path'
import { KeyedCollection } from '@looker/sdk-codegen'
import { warn } from '@looker/sdk-codegen-utils'

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

export type SDKCalls = ISDKCall[]

export interface ISummary {
  /** relative file name */
  sourceFile: string
  /** summary extracted from md, rst, or other doc file */
  summary: string
}

export interface IFileCall {
  /** TODO commit hash. I think we may not need it here at all. */
  hash?: string
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

export interface IFileMine {
  mineFile(fileName: string): SDKCalls
  mineCode(code: string): SDKCalls
}

export interface IDocMine {
  mineFile(fileName: string): ISummary[]
}

const readFile = (fileName: string) =>
  fs.readFileSync(fileName, { encoding: 'utf-8' })

const sdkPattern = /(\b[a-z0-9_]*sdk)\.\s*([a-z0-9_]*)\s*[(<]/gi
const mdPattern = /\[(.*)]\((.*)\)/gi
const linkPattern = /^(.*)\[\[link]]\((.*)\)/gi

export type IMiners = { [key: string]: IFileMine | IDocMine }

export class CodeMiner implements IFileMine {
  mineCode(code: string): SDKCalls {
    const lines = code.split('\n')
    const result: SDKCalls = []
    lines.forEach((line, index) => {
      let match = sdkPattern.exec(line)
      while (match !== null) {
        // TODO need to ignore source code comments
        if (match && match.length > 2) {
          const sdkRef = match[1]
          if (/sdk$/i.test(sdkRef)) {
            const call: ISDKCall = {
              sdk: sdkRef,
              operationId: match[2],
              line: index + 1,
              column: match.index,
            }
            result.push(call)
          }
        }
        match = sdkPattern.exec(line)
      }
    })
    return result
  }

  mineFile(fileName: string): SDKCalls {
    return this.mineCode(readFile(fileName))
  }
}

export class MdMiner implements IDocMine {
  mineFile(fileName: string): ISummary[] {
    const result: ISummary[] = []
    const contents = readFile(fileName)
    const directMatches = mdPattern.exec(contents)
    if (directMatches) {
      directMatches.forEach((value, _pos) => {
        const summary = { sourceFile: value, summary: value }
        result.push(summary)
      })
    }

    const linkMatches = linkPattern.exec(contents)
    if (linkMatches) {
      linkMatches.forEach((value, _pos) => {
        const summary = { sourceFile: value, summary: value }
        result.push(summary)
      })
    }
    return result
  }
}

const fileMiners: IMiners = {
  '.cs': new CodeMiner(),
  '.kt': new CodeMiner(),
  '.py': new CodeMiner(),
  '.swift': new CodeMiner(),
  '.ts': new CodeMiner(),
  '.rb': new CodeMiner(),
  '.md': new MdMiner(),
  '.rst': new MdMiner(), // TODO .rst miner
}

export type FileFilter = (fileName: string) => boolean

export const allFiles = (fileName: string) => fileName.trim().length > 0

export const codeFiles = (fileName: string) => {
  const ext = path.extname(fileName)
  return ext in fileMiners
}

export const getAllFiles = (
  dirPath: string,
  listOfFiles: string[] = [],
  filter: FileFilter = allFiles
) => {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      listOfFiles = getAllFiles(dirPath + '/' + file, listOfFiles, filter)
    } else {
      if (filter(file)) listOfFiles.push(path.join(dirPath, '/', file))
    }
  })

  return listOfFiles
}

export const getCodeFiles = (dirPath: string, listOfFiles: string[] = []) => {
  return getAllFiles(dirPath, listOfFiles, codeFiles)
}

export const getCommitHash = () => 'TODO'

export interface IMine {
  commitHash: string
  nuggets: Nuggets
}

export class Miner {
  summaries: KeyedCollection<string> = {}
  nuggets: Nuggets = {}
  commitHash: string = getCommitHash()
  motherLode: IMine

  constructor(public readonly sourcePath: string) {
    this.execute(sourcePath)
    this.motherLode = { commitHash: this.commitHash, nuggets: this.nuggets }
  }

  addCall(ext: string, fileName: string, call: ISDKCall | ISummary) {
    if ('summary' in call) {
      const s = call as ISummary
      this.summaries[s.sourceFile] = s.summary
    } else {
      let nugget: INugget = this.nuggets[call.operationId]
      if (!nugget) {
        nugget = { operationId: call.operationId, calls: {} }
      }
      // Extension is key for language
      let fileCalls = nugget.calls[ext]
      if (!fileCalls) {
        fileCalls = []
      }
      fileCalls.push({
        sourceFile: fileName,
        column: call.column,
        line: call.line,
        hash: getCommitHash(),
      })
      nugget.calls[ext] = fileCalls
      this.nuggets[nugget.operationId] = nugget
    }
  }

  processFile(fileName: string) {
    const ext = path.extname(fileName)
    if (ext in fileMiners) {
      const coder = fileMiners[ext]
      const calls = coder.mineFile(fileName)
      calls.forEach((call: ISDKCall | ISummary) =>
        this.addCall(ext, fileName, call)
      )
    } else {
      warn(`${fileName} cannot be mined`)
    }
  }

  execute(sourcePath: string | null = null) {
    const dirPath = sourcePath ?? this.sourcePath
    const files = getCodeFiles(dirPath)
    files.forEach((f) => this.processFile(f))
    return this.motherLode
  }
}
