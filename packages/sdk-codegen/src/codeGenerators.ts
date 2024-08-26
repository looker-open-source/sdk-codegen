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

import type { ApiModel } from './sdkModels';
import type { ICodeGen, IVersionInfo } from './codeGen';
import { CSharpGen } from './csharp.gen';
import { KotlinGen } from './kotlin.gen';
import { SwiftGen } from './swift.gen';
import { PythonGen } from './python.gen';
import { TypescriptGen } from './typescript.gen';
import { GoGen } from './go.gen';

export interface IGeneratorSpec {
  /** source code file extension regex */
  extension: RegExp;
  /** name of language SDK to generate */
  language: string;
  /** path name for legacy generator output. Defaults to language */
  path?: string;
  /** code generator constructor */
  factory?: (api: ApiModel, versions?: IVersionInfo) => ICodeGen;
  /** options for the legacy code generator */
  options?: string;
  /** name of the legacy language generator */
  legacy?: string; // legacy language tag
}

// To disable generation of any language specification, just comment it out
export const Generators: IGeneratorSpec[] = [
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new PythonGen(api, versions),
    language: 'Python',
    extension: /\.py/gi,
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new TypescriptGen(api, versions),
    language: 'TypeScript',
    extension: /\.ts(x?)/gi,
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new KotlinGen(api, versions),
    language: 'Kotlin',
    extension: /\.kt/gi,
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new CSharpGen(api, versions),
    language: 'C#',
    legacy: 'csharp',
    options: '-papiPackage=Looker -ppackageName=looker',
    extension: /\.cs/gi,
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new SwiftGen(api, versions),
    language: 'Swift',
    extension: /\.swift/gi,
  },
  {
    factory: (api: ApiModel, versions?: IVersionInfo) =>
      new GoGen(api, versions),
    language: 'Go',
    options: '-papiPackage=Looker -ppackageName=looker',
    extension: /\.go/gi,
  },
  {
    language: 'java',
    legacy: 'java',
    options: '-papiPackage=Looker -ppackageName=looker',
    extension: /\.java/gi,
  },
  {
    language: 'php',
    legacy: 'php',
    options: '-papiPackage=Looker -ppackageName=looker',
    extension: /\.php/gi,
  },
  // {
  //   language: 'R',
  //   legacy: 'r'
  //   options: '-papiPackage=Looker -ppackageName=looker'
  //   extension: /\.r/gi,
  // },
  // {
  //   language: 'Ruby',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  //   extension: /\.rb/gi,
  // },
  // {
  //   language: 'Rust',
  //   options: '-papiPackage=Looker -ppackageName=looker'
  //   extension: /\.rs/gi,
  // },
];

export const codeGenerators = Generators.filter(x => x.factory !== undefined);

/**
 * Matches the code generator based on the language name, alias, file extension, or legacy name
 * @param target label/language/file extension to find in the generator list
 * @returns undefined if the label/language/extension isn't found, otherwise the generator entry
 */
export const findGenerator = (target: string) => {
  target = target.toLocaleLowerCase();
  // Convenience alias
  return codeGenerators.find(
    item =>
      item.language.toLocaleLowerCase() === target ||
      target.match(item.extension) ||
      ('.' + target).match(item.extension) ||
      item.legacy?.toLocaleLowerCase() === target
  );
};

/**
 * constructs a language generator by name lookup
 *
 * CodeGenerator settings can be overridden by creating a config file and adding an entry for the desired language
 *
 * See the `config` folder in this package for more sample config files
 *
 * @param language name, file extension, or alias of code language to generate
 * @param api API specification
 * @param versions version info to use for stamping the agentTag
 * @returns either an ICodeGen implementation or undefined
 */
export const getCodeGenerator = (
  language: string,
  api: ApiModel,
  versions?: IVersionInfo
): ICodeGen | undefined => {
  const generator = findGenerator(language);
  if (generator && generator.factory) {
    return generator.factory(api, versions);
  }
  return undefined;
};

export const legacyLanguages = (): IGeneratorSpec[] => {
  return Generators.filter(x => !!x.legacy);
};
