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

import path from 'path';
import type { DeclarationNuggets, IDeclarationMine } from '@looker/sdk-codegen';

import {
  ExampleMiner,
  filterCodeFiles,
  getCodeFiles,
  getCommitHash,
  getRemoteOrigin,
  readFile,
} from './exampleMiner';

/**
 * Filter that checks if given file name matches any of the specified patterns
 * @param endpointFilePattern A pattern that matches endpoint files
 * @param typeFilePattern A pattern that matches type files
 * @param fileName File name to check against patterns
 */
const fileFilter = (
  endpointFilePattern: RegExp,
  typeFilePattern: RegExp,
  fileName: string
) => {
  const fileMatch =
    endpointFilePattern.test(fileName) || typeFilePattern.test(fileName);
  return filterCodeFiles(fileName) && fileMatch;
};

/**
 * Reference method probe for a Ruby controller
 */
export const rubyMethodProbe = {
  fileNamePattern: /^(?!test).*_controller.rb$/,
  declarationPattern:
    /(?<verb>GET|POST|DELETE|PUT|PATCH)\s(?:"|')\/api\/3\.x(?<path>\S+)(?:"|')/i,
  matchToSpecKeyTransform: (match: RegExpExecArray) => {
    const verb = match.groups!.verb.toLocaleUpperCase();
    const path = match
      .groups!.path.replace(':#', '')
      .replace('#', '')
      .replace(/:(\w+)/g, '{$1}');
    const key = `${verb} ${path}`;
    return key;
  },
};

/**
 * Reference type probe for a Ruby mapper
 */
export const rubyTypeProbe: IProbe = {
  fileNamePattern: /^(?!test).*_mapper.rb$/,
  declarationPattern: /class\s(?<typeName>\w+)Mapper/i,
  matchToSpecKeyTransform: (match: RegExpExecArray) => match.groups!.typeName,
};

export interface IProbe {
  /** Pattern of file names to mine */
  fileNamePattern: RegExp;
  /** Pattern matching the declaration of a method/type */
  declarationPattern: RegExp;
  /** A transform lambda for transforming a declaration match into a spec key */
  matchToSpecKeyTransform: (match: RegExpExecArray) => string;
}

export class DeclarationMiner {
  types: DeclarationNuggets = {};
  methods: DeclarationNuggets = {};

  constructor(
    public readonly sourcePath: string,
    public readonly methodProbe: IProbe,
    public readonly typeProbe: IProbe,
    private readonly originOverride: string
  ) {}

  execute(sourcePath?: string, methodProbe?: IProbe, typeProbe?: IProbe) {
    const filePath = sourcePath ?? this.sourcePath;
    const mProbe = methodProbe ?? this.methodProbe;
    const tProbe = typeProbe ?? this.typeProbe;

    const files = getCodeFiles(
      filePath,
      undefined,
      fileFilter.bind(null, mProbe.fileNamePattern, tProbe.fileNamePattern),
      ['node_modules', 'dist']
    );

    files.forEach((f) => {
      const relFile = this.processFile(f);
      const fileName = path.basename(relFile);
      if (mProbe.fileNamePattern.test(fileName)) {
        this.methods = {
          ...this.methods,
          ...this.mineFile(relFile, f, mProbe),
        };
      } else {
        this.types = { ...this.types, ...this.mineFile(relFile, f, tProbe) };
      }
    });
    return this.lode;
  }

  get commitHash(): string {
    process.chdir(this.sourcePath);
    return getCommitHash();
  }

  get remoteOrigin(): string {
    if (this.originOverride) {
      return this.originOverride;
    }
    process.chdir(this.sourcePath);
    return getRemoteOrigin();
  }

  get lode(): IDeclarationMine {
    return {
      commitHash: this.commitHash,
      remoteOrigin: this.remoteOrigin,
      types: this.types,
      methods: this.methods,
    };
  }

  protected processFile(fileName: string) {
    const relFile = ExampleMiner.relate(this.sourcePath, fileName);
    return relFile;
  }

  protected mineFile(relFile: string, fileName: string, probe: IProbe) {
    return this.mineCode(relFile, readFile(fileName), probe);
  }

  protected mineCode(relFile: string, content: string, probe: IProbe) {
    const lines = content.split('\n');
    const declarations: DeclarationNuggets = {};
    lines.forEach((line, index) => {
      const match = probe.declarationPattern.exec(line);
      if (match) {
        const key = probe.matchToSpecKeyTransform(match);
        declarations[key] = {
          line: index + 1,
          sourceFile: relFile,
        };
      }
    });
    return declarations;
  }
}
