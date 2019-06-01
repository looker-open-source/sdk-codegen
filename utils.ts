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

import { execSync } from 'child_process'

export const utf8 = 'utf-8'

 // Abstraction of log so it can be skipped when quiet mode is enabled
export const log = (message?: any) => console.log(message)

export const quit = (err: Error) => {
  console.error(`Error: ${err.name}, ${err.message}`)
  console.error(err.stack)
  process.exit(1)
  return '' // spoof return type for TypeScript to not complain
}

export const fail = (name: string, message: string) => {
  const err = new Error(message)
  err.name = name
  return quit(err)
}

export const run = async (command: string, args: string[]) => {
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
    return quit(e)
  }
}
