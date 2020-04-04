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

import * as fs from 'fs'
import { execSync } from 'child_process'
import { utf8 } from '../typescript/looker/rtl/constants'

// ANSI colors
const Reset = '\x1b[0m'
// const Bright = "\x1b[1m"
// const Dim = "\x1b[2m"
// const Underscore = "\x1b[4m"
// const Blink = "\x1b[5m"
// const Reverse = "\x1b[7m"
// const Hidden = "\x1b[8m"
//
// const FgBlack = "\x1b[30m"
const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'
const FgYellow = '\x1b[33m'
// const FgBlue = "\x1b[34m"
// const FgMagenta = "\x1b[35m"
// const FgCyan = "\x1b[36m"
// const FgWhite = "\x1b[37m"
//
// const BgBlack = "\x1b[40m"
// const BgRed = "\x1b[41m"
// const BgGreen = "\x1b[42m"
// const BgYellow = "\x1b[43m"
// const BgBlue = "\x1b[44m"
// const BgMagenta = "\x1b[45m"
// const BgCyan = "\x1b[46m"
// const BgWhite = "\x1b[47m"

// Abstraction of log so it can be skipped when quiet mode is enabled
export const log = (message?: any) => {
  console.log(message)
  return message
}

const reset = (message: any) => `${message}${Reset}`

export const warn = (message: any) => log(reset(`${FgYellow}${message}`))

export const danger = (message: any) => {
  return log(reset(`${FgRed}${message}`))
}

export const success = (message: any) => {
  return log(reset(`${FgGreen}${message}`))
}

export const debug = (message: any, value?: any) => {
  if (value !== undefined) console.log(message, '=>', JSON.stringify(value, null, 2))
  else return log(message)
}

export const dump = (value: any) => log(JSON.stringify(value, null, 2))

export const quit = (err?: Error | string) => {
  if (err) {
    if (typeof err === 'string') {
      const message = err
      err = new Error('Failure')
      err.message = message
    }
    console.error(`Error: ${err.name}, ${err.message}`)
    console.error(err.stack)
    process.exit(1)
  } else {
    process.exit(0)
  }
  return '' // spoof return type for TypeScript to not complain
}

export const fail = (name: string, message: string) => {
  const err = new Error(message)
  err.name = name
  return quit(err)
}

export const run = (command: string, args: string[], errMsg?: string, warning: boolean = false) => {
  // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
  const options = {
    maxBuffer: 1024 * 2048,
    timeout: 300 * 1000,
    windowsHide: true,
    encoding: 'utf8',
  }
  try {
    // const result = await spawnSync(command, args, options)
    command += ' ' + args.join(' ')
    const result = execSync(command, options)
    return result
  } catch (e) {
    if (warning) {
      warn(errMsg)
      return ''
    } else {
      return quit(errMsg || e)
    }
  }
}

export const commentBlock = (text: string | undefined, indent: string = '', commentStr: string = '// ') => {
  if (!text) return ''
  text = text.trim()
  if (!text) return ''
  const indenter = indent + commentStr
  return indenter + text.split('\n').join('\n' + indenter)
}

export interface ITypeMapItem {
  type: string,
  default: string
}

export interface ITypeMap {
  [typeformat: string]: ITypeMapItem
}

/**
 * Abstraction of reading a file so all refs go to one place
 * @param filePath name of file
 * @param encoding character encoding. defaults to utf-8
 * @returns {string}
 */
export const readFileSync = (filePath: string, encoding: string = utf8) => fs.readFileSync(filePath, encoding)

export const isDirSync = (filePath: string) => {
  try {
    return fs.statSync(filePath).isDirectory()
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}

export const isFileSync = (filePath: string) => {
  try {
    return fs.statSync(filePath).isFile()
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}
