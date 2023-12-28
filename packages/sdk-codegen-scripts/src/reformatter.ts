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

import * as path from 'path';
import * as fs from 'fs';
import { danger, success, warn } from '@looker/sdk-codegen-utils';
import type { ICodeGen } from '@looker/sdk-codegen';
import { isFileSync, readFileSync, run, utf8 } from './nodeUtils';
import { prettify } from './prettify';

export interface IReformat {
  fileSep: string;
  language: string;
  reformat(files: string[]): string;
  versionStamp(gen: ICodeGen): string;
  skipping(): string;
  reformatted(files: string[]): string;
}

/**
 * wrapper function for writing reformatted files with utf-8 encoding synchronously
 * @param {string} fileName name of file to write
 * @param {string} content content to write
 */
const writeFile = (fileName: string, content: string) => {
  fs.writeFileSync(fileName, content, utf8);
};

const noFormatter = (language: string, files: string[]) => {
  const list = files.join('\n  ');
  return warn(
    `There is no ${language} formatter. Skipped reformatting of:\n  ${list}`
  );
};

const fullPath = (weirdPath: string) => path.resolve(weirdPath);

abstract class BaseFormatter implements IReformat {
  constructor(
    public language: string,
    public fileSep = `  \n`
  ) {}

  reformat(files: string[]): string {
    return noFormatter(this.language, files);
  }

  abstract versionStamp(gen: ICodeGen): string;

  skipping() {
    return warn(
      `Version information was not retrieved. Skipping ${this.language} SDK version updating.`
    );
  }

  reformatted(files: string[]) {
    return success(
      `Reformatted ${this.language} files:\n  ${files.join(this.fileSep)}`
    );
  }
}

class PythonFormatter extends BaseFormatter {
  constructor() {
    super('Python');
  }

  instructions =
    'To reformat Python files, please install pipenv: https://docs.pipenv.org/en/latest/install/#installing-pipenv';

  reformat(files: string[]): string {
    const pipEnvExists = run(
      'command',
      ['-v', 'pipenv'],
      this.instructions,
      true
    );
    if (pipEnvExists.includes('pipenv')) {
      const list = files.join(' ');
      // pipenv check completed without error
      run('pipenv', ['run', 'black', list], 'Python reformat', true);
      return success(files);
    } else {
      return danger(this.instructions);
    }
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions && gen.versions.lookerVersion) {
      const stampFile = fullPath(gen.fileName('sdk/constants'));
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`);
      }
      let content = readFileSync(stampFile);
      const sdkVersionPattern = /sdk_version = ['"].*['"]/i;
      const envPattern = /environment_prefix = ['"].*['"]/i;
      content = content.replace(
        sdkVersionPattern,
        `sdk_version = "${gen.versions.lookerVersion}"`
      );
      content = content.replace(
        envPattern,
        `environment_prefix = "${gen.environmentPrefix}"`
      );
      writeFile(stampFile, content);
      return success(`updated ${stampFile} to ${gen.versions.lookerVersion}`);
    }

    return this.skipping();
  }
}

class TypescriptFormatter extends BaseFormatter {
  constructor() {
    super('TypeScript');
  }

  reformat(files: string[]) {
    files.forEach((f) => {
      this.reformatFile(f);
    });
    return success(files);
  }

  reformatFile(fileName: string) {
    let source = '';
    prettify(readFileSync(fileName)).then((r) => (source = r));
    if (source) {
      fs.writeFileSync(fileName, source, utf8);
    }
    return fileName;
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions && gen.versions.lookerVersion) {
      const stampFile = fullPath(gen.fileName('../../sdk/src/constants'));
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`);
      }
      let content = readFileSync(stampFile);
      const sdkVersionPattern = /sdkVersion = ['"].*['"]/i;
      const envPattern = /environmentPrefix = ['"].*['"]/i;
      content = content.replace(
        sdkVersionPattern,
        `sdkVersion = '${gen.versions.lookerVersion}'`
      );
      content = content.replace(
        envPattern,
        `environmentPrefix = '${gen.environmentPrefix}'`
      );
      writeFile(stampFile, content);
      return success(`updated ${stampFile} to ${gen.versions.lookerVersion}`);
    }

    return this.skipping();
  }
}

class KotlinFormatter extends BaseFormatter {
  // TODO Kotlin formatter
  constructor() {
    super('Kotlin');
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions && gen.versions.lookerVersion) {
      const stampFile = fullPath(gen.fileName('sdk/Constants'));
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`);
      }
      let content = readFileSync(stampFile);
      const lookerPattern = /\bLOOKER_VERSION = ['"].*['"]/i;
      const apiPattern = /\bAPI_VERSION = ['"].*['"]/i;
      const envPattern = /\bENVIRONMENT_PREFIX = ['"].*['"]/i;
      content = content.replace(
        lookerPattern,
        `LOOKER_VERSION = "${gen.versions.lookerVersion}"`
      );
      content = content.replace(
        apiPattern,
        `API_VERSION = "${gen.versions.spec.version}"`
      );
      content = content.replace(
        envPattern,
        `ENVIRONMENT_PREFIX = "${gen.environmentPrefix}"`
      );
      writeFile(stampFile, content);
      return success(
        `updated ${stampFile} to ${gen.versions.spec.version}.${gen.versions.lookerVersion}`
      );
    }
    return this.skipping();
  }
}

class SwiftFormatter extends BaseFormatter {
  // TODO Swift formatter
  constructor() {
    super('Swift');
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions && gen.versions.lookerVersion) {
      const stampFile = fullPath(gen.fileName('rtl/constants'));
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`);
      }
      let content = readFileSync(stampFile);
      const lookerPattern = /lookerVersion = ['"].*['"]/i;
      const apiPattern = /apiVersion = ['"].*['"]/i;
      const envPattern = /environmentPrefix = ['"].*['"]/i;
      content = content.replace(
        lookerPattern,
        `lookerVersion = "${gen.versions.lookerVersion}"`
      );
      content = content.replace(
        apiPattern,
        `apiVersion = "${gen.versions.spec.version}"`
      );
      content = content.replace(
        envPattern,
        `environmentPrefix = "${gen.environmentPrefix}"`
      );
      writeFile(stampFile, content);
      return success(
        `updated ${stampFile} to ${gen.versions.spec.version}.${gen.versions.lookerVersion}`
      );
    }
    return this.skipping();
  }
}

class CsharpFormatter extends BaseFormatter {
  // TODO C# formatter https://github.com/dotnet/format
  constructor() {
    super('C#');
  }

  versionStamp(gen: ICodeGen) {
    if (gen.versions && gen.versions.lookerVersion) {
      const stampFile = fullPath(gen.fileName('rtl/Constants'));
      if (!isFileSync(stampFile)) {
        warn(`${stampFile} was not found. Skipping version update.`);
      }
      let content = readFileSync(stampFile);
      const lookerPattern = /LookerVersion = ['"].*['"]/i;
      const apiPattern = /ApiVersion = ['"].*['"]/i;
      const envPattern = /EnvironmentPrefix = ['"].*['"]/i;
      content = content.replace(
        lookerPattern,
        `LookerVersion = "${gen.versions.lookerVersion}"`
      );
      content = content.replace(
        apiPattern,
        `ApiVersion = "${gen.versions.spec.version}"`
      );
      content = content.replace(
        envPattern,
        `EnvironmentPrefix = "${gen.environmentPrefix}"`
      );
      writeFile(stampFile, content);
      return success(
        `updated ${stampFile} to ${gen.versions.spec.version}.${gen.versions.lookerVersion}`
      );
    }
    return this.skipping();
  }
}

class GoFormatter extends BaseFormatter {
  // TODO Go formatter
  constructor() {
    super('Go');
  }

  instructions =
    'To reformat Go files, please install gofmt: https://go.dev/blog/gofmt';

  reformat(files: string[]): string {
    const gofmtExists = run(
      'command',
      ['-v', 'gofmt'],
      this.instructions,
      true
    );
    if (gofmtExists.includes('gofmt')) {
      const list = files.join(' ');
      // gofmt check completed without error
      run('gofmt', ['-w', list], 'Go reformat', true);
      return success(files);
    } else {
      return danger(this.instructions);
    }
  }

  versionStamp() {
    return warn('Skipping SDK version updating - not implemented for Go.');
  }
}

type IFormatFiles = { [key: string]: string[] };

type IFormatters = { [key: string]: IReformat };

const fileFormatters: IFormatters = {
  '.cs': new CsharpFormatter(),
  '.kt': new KotlinFormatter(),
  '.py': new PythonFormatter(),
  '.swift': new SwiftFormatter(),
  '.ts': new TypescriptFormatter(),
  '.go': new GoFormatter(),
};

export class FilesFormatter {
  files: IFormatFiles = {};

  addFile(fileName: string) {
    const key = path.extname(fileName);
    if (key in this.files) {
      this.files[key].push(fileName);
    } else {
      this.files[key] = [fileName];
    }
  }

  clear() {
    this.files = {};
  }

  reformat(files?: string[]) {
    if (files) files.forEach((f) => this.addFile(f));
    Object.entries(this.files).forEach(([key, list]) => {
      if (key in fileFormatters) {
        fileFormatters[key].reformat(list);
      }
    });
  }

  versionStamp(gen: ICodeGen) {
    const formatter = fileFormatters[gen.fileExtension];
    return formatter.versionStamp(gen);
  }
}
