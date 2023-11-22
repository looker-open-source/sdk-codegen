/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import { execSync } from 'child_process'
import { warn } from '@looker/sdk-codegen-utils'
import type {
  IFileCall,
  INugget,
  ISDKCall,
  ISummary,
  Nuggets,
  SDKCalls,
  Summaries,
  IExampleMine,
} from '@looker/sdk-codegen'

export interface IFileMine {
  mineFile(fileName: string): SDKCalls
  mineCode(code: string): SDKCalls
  ignoreCall(call: ISDKCall): boolean
}

export interface IDocMine {
  mineFile(fileName: string): ISummary[]
  mineContent(sourceFile: string, content: string): ISummary[]
  ignoreLink(fileName: string): boolean
}

export const readFile = (fileName: string) =>
  fs.readFileSync(fileName, { encoding: 'utf-8' })

const sdkPattern = /(\b[a-z0-9_]*sdk)\.\s*([a-z0-9_]*)\s*[(<]/gi
const mdPattern = /(\[(.+?)\]\((.+?)\))/gim
const linkPattern = /(.*)\[\[link\]\]\((.+?)\)/gim

export type IMiners = { [key: string]: IFileMine | IDocMine }

/** file-filtering lambda for `getAllFiles()` and `getCodeFiles()` */
export type FileFilter = (fileName: string, pattern?: RegExp) => boolean

/**
 * Filter to include every file that has a non-empty file name
 * @param fileName name of file to check
 */
export const filterAllFiles = (fileName: string) => fileName.trim().length > 0

/**
 * Filter for code files
 * @param fileName name of file from which to extract its extension
 */
export const filterCodeFiles = (fileName: string) => {
  if (/(^|\/)node_modules\//gi.test(fileName)) return false
  const ext = path.extname(fileName).toLocaleLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return ext in fileMiners
}

export const IGNORE_PATHS = [
  'node_modules',
  'lib',
  'dist',
  'bazel-bin',
  'build',
  'bin',
  '.build',
  '.direnv',
  '.github',
  '.vscode',
  '.idea',
  '.gradle',
  'results',
]

const skipFolder = (name: string, excludeList: string[] = IGNORE_PATHS) =>
  new RegExp(excludeList.join('|'), 'gi').test(name)

/**
 * Finds all file recursively
 * @param searchPath starting directory for file search
 * @param listOfFiles list of current files already found
 * @param filter lambda for file inclusion in results. truthy analyzes the file
 * @param ignorePaths paths to ignore
 */
export const getAllFiles = (
  searchPath: string,
  listOfFiles: string[] = [],
  filter: FileFilter = filterAllFiles,
  ignorePaths: string[] = []
) => {
  const files = fs.readdirSync(searchPath)

  files.forEach((file) => {
    try {
      if (fs.statSync(searchPath + '/' + file).isDirectory()) {
        if (!skipFolder(file, ignorePaths))
          listOfFiles = getAllFiles(
            searchPath + '/' + file,
            listOfFiles,
            filter,
            ignorePaths
          )
      } else {
        if (filter(file)) {
          const fileName = path.join(searchPath, '/', file)
          listOfFiles.push(fileName)
        }
      }
    } catch (_e: any) {
      // warn(`skipping ${file}: ${e}`)
    }
  })

  return listOfFiles
}

/**
 * Find all source code files recursively
 * @param searchPath starting directory for file search
 * @param listOfFiles list of source code files that can be mined
 * @param filter function to determine whether a file should be analyzed
 * @param ignorePaths paths to ignore
 */
export const getCodeFiles = (
  searchPath: string,
  listOfFiles: string[] = [],
  filter: FileFilter = filterCodeFiles,
  ignorePaths: string[] = IGNORE_PATHS
) => {
  return getAllFiles(searchPath, listOfFiles, filter, ignorePaths)
}

/** get the trimmed output of the command as a UTF-8 string */
export const execRead = (command: string) => {
  return execSync(command, { encoding: 'utf-8' }).trim()
}

/** get this git repository's current commit hash */
export const getCommitHash = () => execRead('git rev-parse HEAD')

/** get the remote origin url for this repository */
export const getRemoteOrigin = () => {
  return execRead('git remote get-url origin')
}

/**
 * Convert this github repository's git address to an HTTP url
 */
export const getRemoteHttpOrigin = () => {
  const origin = getRemoteOrigin()
  const gitExtractor = /git@github\.com:(.*)\.git/gi
  let match = gitExtractor.exec(origin)
  if (!match) {
    // git origin on CI: https://github.com/looker-open-source/sdk-codegen
    const httpExtractor = /(https:\/\/github.com.*)(|.git)/
    match = httpExtractor.exec(origin)
    if (!match) {
      return ''
    }
    return match[1]
  }
  return `https://github.com/${match[1]}`
}

/** Permalink paths should not have the `.git` ending for a repo */
export const getPermalinkRoot = () => {
  let root = getRemoteHttpOrigin()
  if (root.endsWith('.git')) root = root.substr(0, root.length - 4)
  return root
}

export class CodeMiner implements IFileMine {
  static ignoreOps = new Set<string>(['ok', 'init40'])
  ignoreCall(call: ISDKCall): boolean {
    if (!/sdk/i.test(call.sdk)) return true
    return CodeMiner.ignoreOps.has(call.operationId)
  }

  mineCode(sourceCode: string): SDKCalls {
    const lines = sourceCode.split('\n')
    const result: SDKCalls = []
    lines.forEach((line, index) => {
      let match = sdkPattern.exec(line)
      while (match !== null) {
        // TODO need to ignore source code comments?
        if (match && match.length > 2) {
          const sdkRef = match[1].trim()
          const call: ISDKCall = {
            sdk: sdkRef,
            operationId: match[2].trim(),
            line: index + 1,
            column: match.index,
          }
          if (!this.ignoreCall(call)) {
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

/**
 * Processes markdown files and extracts links to source code to use as summaries
 */
export class MarkdownMiner implements IDocMine {
  // TODO ensure summaries don't include markdown files
  ignoreLink(linkFile: string): boolean {
    linkFile = this.stripSearch(linkFile)
    const ext = path.extname(linkFile).toLocaleLowerCase()
    const notCode = ext === '.md' || !filterCodeFiles(linkFile)
    const isHttp = /^(http|https):/gi.test(linkFile)
    return notCode || isHttp
  }

  /**
   * Remove leading - from a string
   * @param value string to process
   */
  noDash(value: string) {
    value = value.trim()
    const dasher = /^\s*-\s*(.*)/g
    if (dasher.test(value)) {
      value = value.replace(dasher, '$1')
    }
    return value.trim()
  }

  stripSearch(fileName: string) {
    fileName = fileName.trim()
    const match = /(.*)#.*/gi.exec(fileName)
    if (match) fileName = match[1]
    return fileName
  }

  /**
   * Fully qualify the path for `linkFile`
   * @param sourceFileName
   * @param linkFile
   */
  sourcerer(sourceFileName: string, linkFile: string) {
    linkFile = this.stripSearch(linkFile)
    if (linkFile.startsWith('/')) return linkFile.substr(1)
    const base = path.dirname(sourceFileName)
    return path.join(base, '/', linkFile)
  }

  /**
   * Get all links from content
   * @param fileName fully qualified source file name
   * @param content markdown to parse
   */
  mineContent(fileName: string, content: string): ISummary[] {
    const result: ISummary[] = []
    let match = mdPattern.exec(content)
    let linkFile: string
    while (match !== null) {
      const summary = this.noDash(match[2])
      linkFile = this.stripSearch(match[3])
      if (!this.ignoreLink(linkFile)) {
        if (
          summary.localeCompare('[link]', undefined, {
            sensitivity: 'base',
          }) !== 0
        ) {
          linkFile = this.sourcerer(fileName, linkFile)
          result.push({ summary, sourceFile: linkFile })
        }
      }
      match = mdPattern.exec(content)
    }

    match = linkPattern.exec(content)
    while (match != null) {
      const summary = this.noDash(match[1])
      linkFile = this.stripSearch(match[2])
      if (!this.ignoreLink(linkFile)) {
        linkFile = this.sourcerer(fileName, linkFile)
        result.push({ summary, sourceFile: linkFile })
      }
      match = linkPattern.exec(content)
    }
    return result
  }

  mineFile(fileName: string): ISummary[] {
    return this.mineContent(fileName, readFile(fileName))
  }
}

const fileMiners: IMiners = {
  '.cs': new CodeMiner(),
  '.kt': new CodeMiner(),
  '.py': new CodeMiner(),
  '.swift': new CodeMiner(),
  '.ts': new CodeMiner(),
  '.tsx': new CodeMiner(),
  '.rb': new CodeMiner(),
  '.md': new MarkdownMiner(),
  '.dart': new CodeMiner(),
  '.go': new CodeMiner(),
  '.java': new CodeMiner(),
  // '.rst': new MarkdownMiner(), // TODO .rst miner? Probably not needed
}

export class ExampleMiner {
  summaries: Summaries = {}
  nuggets: Nuggets = {}
  commitHash: string = getCommitHash()
  remoteOrigin: string = getPermalinkRoot()

  constructor(public readonly sourcePath: string) {
    this.execute(sourcePath)
  }

  get lode(): IExampleMine {
    return {
      commitHash: this.commitHash,
      remoteOrigin: this.remoteOrigin,
      summaries: this.summaries,
      nuggets: this.nuggets,
    }
  }

  addCall(ext: string, relativeFile: string, call: ISDKCall | ISummary) {
    function addFileCall(nugget: INugget) {
      // Extension is key for language
      let fileCalls = nugget.calls[ext]
      if (!fileCalls) {
        fileCalls = []
      }
      const sdkCall = call as ISDKCall
      const fileCall: IFileCall = {
        sourceFile: relativeFile,
        column: sdkCall.column,
        line: sdkCall.line,
      }
      if (
        !fileCalls.find(
          (f) =>
            f.line === fileCall.line &&
            f.column === fileCall.column &&
            f.sourceFile === fileCall.sourceFile
        )
      )
        fileCalls.push(fileCall)
      nugget.calls[ext] = fileCalls
    }

    if ('summary' in call) {
      const s = call as ISummary
      s.sourceFile = ExampleMiner.relate(this.sourcePath, s.sourceFile)
      this.summaries[s.sourceFile] = s
    } else {
      let nugget: INugget = this.nuggets[call.operationId]
      if (!nugget) {
        nugget = { operationId: call.operationId, calls: {} }
      }
      addFileCall(nugget)
      this.nuggets[nugget.operationId] = nugget
    }
  }

  /**
   * Derive relative path, retaining last directory
   * @param sourcePath original file search path
   * @param fileName fully qualified name of found file
   *
   * @example `Miner.relate('/a/b/c/', '/a/b/c/d.txt')` returns 'd.txt'
   */
  public static relate(sourcePath: string, fileName: string) {
    return path.relative(sourcePath, fileName)
  }

  processFile(fileName: string) {
    const ext = path.extname(fileName)
    if (ext in fileMiners) {
      const coder = fileMiners[ext]
      const calls = coder.mineFile(fileName)
      calls.forEach((call: ISDKCall | ISummary) => {
        const relFile = ExampleMiner.relate(this.sourcePath, fileName)
        this.addCall(ext, relFile, call)
      })
    } else {
      warn(`${fileName} cannot be mined`)
    }
  }

  execute(sourcePath: string | null = null) {
    const dirPath = sourcePath ?? this.sourcePath
    const files = getCodeFiles(dirPath)
    files.forEach((f) => this.processFile(f))
    return this.lode
  }
}
