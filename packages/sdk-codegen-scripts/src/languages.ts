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

import config from 'config';
import type { ApiModel, ICodeGen, IVersionInfo } from '@looker/sdk-codegen';
import { codeGenerators, getCodeGenerator } from '@looker/sdk-codegen';
import { quit } from './nodeUtils';

/**
 * constructs a language generator by name
 *
 * CodeGenerator settings can be overridden by creating a config file and adding an entry for the desired language
 *
 * See the `config` folder in this package for more sample config files
 *
 * @param language name or alias of code language to generate
 * @param api API specification
 * @param versions version info to use for stamping the agentTag
 * @returns either an ICodeGen implementation or undefined
 */
export const getGenerator = (
  language: string,
  api: ApiModel,
  versions?: IVersionInfo
): ICodeGen | undefined => {
  const gen: any = getCodeGenerator(language, api, versions);
  if (!gen) {
    const langs = codeGenerators.map(item => item.language);
    quit(
      `"${language}" is not a recognized language. Supported languages are: all, ${langs.join(
        ', '
      )}`
    );
    // TS doesn't know quit() exits the program
    return undefined;
  }

  if (config.has(language)) {
    const overrides: any = config.get<ICodeGen>(language);
    // Spread operator loses class functions
    // gen = { ...gen, ...overrides }
    Object.keys(overrides).forEach(key => {
      if (key in gen) {
        gen[key] = overrides[key];
      }
    });
  }
  return gen;
};
