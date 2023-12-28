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

import * as fs from 'fs';
import type { ExecSyncOptionsWithStringEncoding } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import { warn } from '@looker/sdk-codegen-utils';

export const utf8 = 'utf-8';

/**
 * Abstraction of reading a file so all refs go to one place
 * @param filePath name of file
 * @returns {string}
 */
export const readFileSync = (filePath: string) =>
  fs.readFileSync(filePath, utf8);

export const writeFileSync = (filePath: string, data: any) =>
  fs.writeFileSync(filePath, data, utf8);

export const isDirSync = (filePath: string) => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
};

const homeToRoost = '../../../';

export const getRootPath = () => path.join(__dirname, homeToRoost);
export const rootFile = (fileName = '') => path.join(getRootPath(), fileName);

/**
 * Creates the directory if needed, converts content to JSON string, writes file
 *
 * @param fileName to write that may include a relative path
 * @param {object | string} content to convert to a JSON string
 * @returns name of file written
 */
export const createJsonFile = (
  fileName: string,
  content: Record<string, unknown> | string
) => {
  const fullName = rootFile(fileName);
  const dir = path.dirname(fullName);
  const data = typeof content === 'string' ? content : JSON.stringify(content);
  if (!isDirSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullName, data, utf8);
  return fullName;
};

export const isFileSync = (filePath: string) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
};

export const quit = (err?: Error | string) => {
  if (err) {
    if (typeof err === 'string') {
      const message = err;
      err = new Error('Failure');
      err.message = message;
    }
    console.error(`Error: ${err.name}, ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  } else {
    process.exit(0);
  }
  return ''; // spoof return type for TypeScript to not complain
};

export const fail = (name: string, message: string) => {
  const err = new Error(message);
  err.name = name;
  return quit(err);
};

export const run = (
  command: string,
  args: string[],
  errMsg?: string,
  warning = false
) => {
  // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
  const options: ExecSyncOptionsWithStringEncoding = {
    encoding: 'utf8',
    maxBuffer: 1024 * 2048,
    timeout: 300 * 1000,
    windowsHide: true,
  };
  try {
    // const result = await spawnSync(command, args, options)
    command += ' ' + args.join(' ');
    return execSync(command, options);
  } catch (e: any) {
    if (warning) {
      warn(`${errMsg}: ${e.message}`);
      return '';
    } else {
      return quit(errMsg || e);
    }
  }
};
