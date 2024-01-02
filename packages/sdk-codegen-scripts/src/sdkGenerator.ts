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

import { existsSync } from 'fs';
import * as Models from '@looker/sdk-codegen';
import { success, warn } from '@looker/sdk-codegen-utils';
import { readFileSync } from './nodeUtils';

export const specFromFile = (specFile: string): Models.ApiModel => {
  const specContent = readFileSync(specFile);
  return Models.ApiModel.fromString(specContent);
};

export interface IGeneratorCtor<T extends Models.IModel> {
  new (model: T, formatter: Models.ICodeGen): Generator<T>;
}

const licenseFile = `./LICENSE`;
const licenseText = existsSync(licenseFile)
  ? readFileSync('./LICENSE')
  : `${licenseFile} file not found`;

export abstract class Generator<T extends Models.IModel> {
  codeFormatter: Models.ICodeGen;
  model: T;
  buf: string[] = [];

  constructor(model: T, formatter: Models.ICodeGen) {
    this.model = model;
    this.codeFormatter = formatter;
  }

  abstract render(indent: string, noStreams: boolean): string;

  // Add one or more strings to the internal buffer
  // if the string is not empty or undefined
  p(str?: string | string[]): this {
    if (typeof str !== 'undefined' && str.length > 0) {
      this.buf = this.buf.concat(str);
    }
    return this;
  }

  toString(indent: string): string {
    return indent + this.buf.join('\n' + indent);
  }
}

const noComment = ' ';

export class MethodGenerator extends Generator<Models.IApiModel> {
  itemGenerator(indent: string, method: Models.IMethod) {
    return this.codeFormatter.declareMethod(indent, method);
  }

  prologue(indent: string) {
    return this.codeFormatter.methodsPrologue(indent);
  }

  epilogue(indent: string) {
    return this.codeFormatter.methodsEpilogue(indent);
  }

  render(indent: string, noStreams = false) {
    this.codeFormatter.reset();
    const items: string[] = [];
    // reset refcounts for ALL types so dynamic import statement will work
    Object.values(this.model.types).forEach((type) => (type.refCount = 0));
    let tagCount = 0;
    Object.entries(this.model.tags).forEach(([tagName, methods]) => {
      const tag = this.model.spec.tags?.find(
        (t) =>
          t.name.localeCompare(tagName, undefined, { sensitivity: 'base' }) ===
          0
      );
      if (!tag) {
        warn(`Could not find tag ${tagName} in API specification`);
      }
      if (tag) {
        tagCount++;
        items.push(
          this.codeFormatter.beginRegion(
            indent,
            `${tag.name}: ${tag.description}`
          )
        );
        Object.values(methods).forEach((method) => {
          items.push(this.itemGenerator(indent, method));
        });
        items.push(
          this.codeFormatter.endRegion(
            indent,
            `${tag.name}: ${tag.description}`
          )
        );
      }
    });
    let tally = `${items.length - tagCount} API methods`;
    success(tally);
    if (noStreams) {
      // Minimize code changes, don't include the tally when not streaming
      tally = '';
    }
    return this.p(this.codeFormatter.commentHeader('', licenseText, noComment))
      .p(this.codeFormatter.commentHeader('', tally))
      .p(this.prologue(indent))
      .p(items.join('\n\n'))
      .p(this.epilogue(indent))
      .toString('');
  }
}

export class StreamGenerator extends MethodGenerator {
  itemGenerator(indent: string, method: Models.IMethod) {
    return this.codeFormatter.declareStreamer(indent, method);
  }

  prologue(indent: string) {
    return this.codeFormatter.streamsPrologue(indent);
  }

  epilogue(indent: string) {
    return this.codeFormatter.methodsEpilogue(indent);
  }
}

export class InterfaceGenerator extends MethodGenerator {
  itemGenerator(indent: string, method: Models.IMethod) {
    return this.codeFormatter.declareInterface(indent, method);
  }

  prologue(indent: string) {
    return this.codeFormatter.interfacesPrologue(indent);
  }

  epilogue(indent: string) {
    return this.codeFormatter.methodsEpilogue(indent);
  }
}

export class FunctionGenerator extends MethodGenerator {
  itemGenerator(indent: string, method: Models.IMethod) {
    return this.codeFormatter.declareFunction(indent, method);
  }

  prologue(indent: string) {
    return this.codeFormatter.functionsPrologue(indent);
  }

  epilogue(indent: string) {
    return this.codeFormatter.functionsEpilogue(indent);
  }
}

export class TypeGenerator extends Generator<Models.IApiModel> {
  render(indent: string, noStreams = false) {
    this.codeFormatter.reset();
    const items: string[] = [];
    Object.values(this.model.types).forEach((type) => {
      if (!(type instanceof Models.IntrinsicType)) {
        if (
          !this.codeFormatter.useNamedParameters ||
          !(type instanceof Models.RequestType)
        ) {
          items.push(this.codeFormatter.declareType(indent, type));
        }
      }
    });

    const counts = this.typeTally(this.model.types);
    let tally = `${counts.total} API models: ${counts.standard} Spec, ${counts.request} Request, ${counts.write} Write, ${counts.enums} Enum`;
    success(tally);
    if (noStreams) {
      // Minimize code changes, don't include the tally when not streaming
      tally = '';
    }
    return this.p(this.codeFormatter.commentHeader('', licenseText, noComment))
      .p(this.codeFormatter.commentHeader('', tally))
      .p(this.codeFormatter.modelsPrologue(indent))
      .p(items.join('\n\n'))
      .p(this.codeFormatter.modelsEpilogue(indent))
      .toString(indent);
  }

  typeTally(types: Record<string, Models.IType>) {
    let request = 0;
    let write = 0;
    let standard = 0;
    let enums = 0;
    Object.values(types)
      .filter((type) => !(type instanceof Models.IntrinsicType))
      .forEach((type) => {
        if (type instanceof Models.RequestType) {
          if (type.refCount > 0) request++;
        } else if (type instanceof Models.WriteType) {
          if (type.refCount > 0) write++;
        } else if (type instanceof Models.EnumType) {
          if (type.refCount > 0) enums++;
        } else {
          standard++;
        }
      });
    return {
      request,
      standard,
      total: standard + write + request + enums,
      write,
      enums,
    };
  }
}
