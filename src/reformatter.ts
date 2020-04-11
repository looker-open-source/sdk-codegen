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

import * as path from 'path'
import { danger, success, warn } from './utils'
import { isFileSync, readFileSync, run, utf8Encoding } from './nodeUtils'
import * as prettier from 'prettier'
import * as fs from "fs"
import { ICodeGen } from './sdkModels'

export interface IReformat {
  reformat(files: string[]): string
  versionStamp(gen: ICodeGen): string
}

const fileSep = '\n  '

class PythonFormatter implements IReformat {
  instructions = 'To reformat Python files, please install pipenv: https://docs.pipenv.org/en/latest/install/#installing-pipenv'
  reformat(files: string[]): string {
    const pipEnvExists = run('command', ['-v', 'pipenv'], this.instructions, true)
    if (pipEnvExists.includes('pipenv')) {
      const list = files.join(" ")
      // pipenv check completed without error
      run('pipenv', ['run', 'black', list])
      return success(`Reformatted Python files:\n  ${files.join(fileSep)}`)
    } else {
      return danger(this.instructions)
    }

  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions) {
      const stampFile = gen.fileName('rtl/constants')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = readFileSync(stampFile)
      const lookerPattern = /looker_version = ['"].*['"]/i
      const apiPattern = /api_version = ['"].*['"]/i
      const envPattern = /environment_prefix = ['"].*['"]/i
      content = content.replace(lookerPattern, `looker_version = "${gen.versions.lookerVersion}"`)
      content = content.replace(apiPattern, `api_version = "${gen.versions.apiVersion}"`)
      content = content.replace(envPattern, `environment_prefix = "${gen.environmentPrefix}"`)
      fs.writeFileSync(stampFile, content, utf8Encoding)
      return success(`updated ${stampFile} to ${gen.versions.apiVersion}.${gen.versions.lookerVersion}` )
    }

    return warn('Version information was not retrieved. Skipping Python SDK version updating.')
  }

}

class TypescriptFormatter implements IReformat {
  formatOptions: prettier.Options = {
    semi: false,
    trailingComma: 'all',
    bracketSpacing: true,
    parser: 'typescript',
    singleQuote: true,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    endOfLine: 'auto'
  }

  reformat(files: string[]): string {
    files.forEach(f => {
      this.reformatFile(f)

    })
    return success(`Reformatted Typescript files\n:  ${files.join(fileSep)}`)
  }

  reformatFile(fileName: string) {
    const source = prettier.format(readFileSync(fileName), this.formatOptions)
    if (source) {
      fs.writeFileSync(fileName, source, utf8Encoding)
    }
    return fileName
  }

  versionStamp(gen: ICodeGen) {

    if (gen.versions) {
      const stampFile = gen.fileName('rtl/constants')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = readFileSync(stampFile)
      const lookerPattern = /lookerVersion = ['"].*['"]/i
      const apiPattern = /\bapiVersion = ['"].*['"]/i
      const envPattern = /environmentPrefix = ['"].*['"]/i
      content = content.replace(lookerPattern, `lookerVersion = '${gen.versions.lookerVersion}'`)
      content = content.replace(apiPattern, `apiVersion = '${gen.versions.apiVersion}'`)
      content = content.replace(envPattern, `environmentPrefix = '${gen.environmentPrefix}'`)
      fs.writeFileSync(stampFile, content, utf8Encoding)
      return success(`updated ${stampFile} to ${gen.versions.apiVersion}.${gen.versions.lookerVersion}`)
    }

    return warn('Version information was not retrieved. Skipping Typescript SDK version updating.')
  }

}

const noFormatter = (language: string, files: string[]) => {
  const list = files.join(fileSep)
  return warn(`There is no ${language} formatter. Skipped reformatting of:\n  ${list}`)
}

class KotlinFormatter implements IReformat {
  // TODO Kotlin formatter
  reformat(files: string[]): string {
    return noFormatter('Kotlin', files)
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions) {
      const stampFile = gen.fileName('rtl/Constants')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = readFileSync(stampFile)
      const lookerPattern = /\bLOOKER_VERSION = ['"].*['"]/i
      const apiPattern = /\bAPI_VERSION = ['"].*['"]/i
      const envPattern = /\bENVIRONMENT_PREFIX = ['"].*['"]/i
      content = content.replace(lookerPattern, `LOOKER_VERSION = "${gen.versions.lookerVersion}"`)
      content = content.replace(apiPattern, `API_VERSION = "${gen.versions.apiVersion}"`)
      content = content.replace(envPattern, `ENVIRONMENT_PREFIX = "${gen.environmentPrefix}"`)
      fs.writeFileSync(stampFile, content, utf8Encoding)
      return success(`updated ${stampFile} to ${gen.versions.apiVersion}.${gen.versions.lookerVersion}`)
    }
    return warn('Version information was not retrieved. Skipping Python SDK version updating.')
  }

}

class SwiftFormatter implements IReformat {
  // TODO Swift formatter
  reformat(files: string[]): string {
    return noFormatter('Swift', files)
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions) {
      const stampFile = gen.fileName('rtl/constants')
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`)
      }
      let content = readFileSync(stampFile)
      const lookerPattern = /lookerVersion = ['"].*['"]/i
      const apiPattern = /apiVersion = ['"].*['"]/i
      const envPattern = /environmentPrefix = ['"].*['"]/i
      content = content.replace(lookerPattern, `lookerVersion = "${gen.versions.lookerVersion}"`)
      content = content.replace(apiPattern, `apiVersion = "${gen.versions.apiVersion}"`)
      content = content.replace(envPattern, `environmentPrefix = "${gen.environmentPrefix}"`)
      fs.writeFileSync(stampFile, content, utf8Encoding)
      return success(`updated ${stampFile} to ${gen.versions.apiVersion}.${gen.versions.lookerVersion}`)
    }
    return warn('Version information was not retrieved. Skipping SDK version updating.')
  }

}

type IFormatFiles = {[key:string]: string[]}

type IFormatters = {[key:string]: IReformat}

const fileFormatters: IFormatters = {
  '.py': new PythonFormatter(),
  '.ts': new TypescriptFormatter(),
  '.swift': new SwiftFormatter(),
  '.kt': new KotlinFormatter(),
}

export class FilesFormatter {
  files: IFormatFiles = {}

  addFile(fileName: string) {
    const key = path.extname(fileName)
    if (key in this.files) {
      this.files[key].push(fileName)
    } else {
      this.files[key] = [fileName]
    }
  }

  clear() {
    this.files = {}
  }

  reformat(files?: string[]) {
    if (files) files.forEach(f => this.addFile(f))
    Object.entries(this.files).forEach(([key, list]) => {
      if (key in fileFormatters) {
        fileFormatters[key].reformat(list)
      }
    })
  }

  versionStamp(gen: ICodeGen) {
    const formatter = fileFormatters[gen.fileExtension]
    return formatter.versionStamp(gen)
  }

}
