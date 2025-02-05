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
import { writeFileSync } from 'fs';
import type { DiffFilter, DiffRow, IMethod } from '@looker/sdk-codegen';
import {
  ApiModel,
  csvDiffRow,
  csvHeaderRow,
  includeDiffs,
  mdDiffRow,
  mdHeaderRow,
  upgradeSpecObject,
} from '@looker/sdk-codegen';
import { compareSpecs } from '@looker/sdk-codegen/src/specDiff';
import { readFileSync } from '../src';

interface IDiffer {
  /** Name of spec file A */
  fileA: string;
  /** Name of spec file B */
  fileB: string;
  /** Output format */
  format: string;
  /** Beta status check? */
  status: string;
}

const rootPath = path.join(__dirname, '../../../spec');

const getOptions = () => {
  const result: IDiffer = {
    fileA: path.join(rootPath, 'Looker.3.1.oas.json'),
    fileB: path.join(rootPath, 'Looker.4.0.oas.json'),
    format: 'csv',
    status: 'beta',
  };
  const args = process.argv.slice(1);
  /* eslint-disable no-console */
  console.log(`${args[0]} [fileA] [fileB] [format] [status]\n
format=csv|md
status=beta|all
`);
  if (args.length > 1) {
    result.fileA = args[1];
  }
  if (args.length > 2) {
    result.fileB = args[2];
  }
  if (args.length > 3) {
    const val = args[3].toLowerCase();
    if (!['csv', 'md'].includes(val)) {
      throw new Error(`"${val}" is not a recognized format`);
    }
    result.format = val;
  }
  if (args.length > 4) {
    const val = args[4].toLowerCase();
    if (!['all', 'beta'].includes(val)) {
      throw new Error(`"${val}" is not a recognized diff check status`);
    }
    result.status = args[4].toLowerCase();
  }
  console.log(`using:\n${JSON.stringify(result, null, 2)}`);

  return result;
};

function oaSpec(fileName: string) {
  const spec = JSON.parse(readFileSync(fileName));
  return ApiModel.fromJson(upgradeSpecObject(spec));
}

function checkSpecs() {
  const opt = getOptions();
  const specA = oaSpec(opt.fileA);
  const specB = oaSpec(opt.fileB);

  const filter: DiffFilter =
    opt.status === 'beta'
      ? (_delta: DiffRow, lMethod?: IMethod, _?: IMethod) =>
          lMethod?.status === 'beta'
      : includeDiffs;

  const diff = compareSpecs(specA, specB, filter);

  let result = '';
  switch (opt.format) {
    case 'csv':
      result = csvHeaderRow;
      diff.forEach(diffRow => {
        result += csvDiffRow(diffRow);
      });
      break;
    case 'md':
      result = mdHeaderRow;
      diff.forEach(diffRow => {
        result += mdDiffRow(diffRow);
      });
      break;
  }

  const outFile = path.join(rootPath, `../results.${opt.format}`);
  writeFileSync(outFile, result, {
    encoding: 'utf-8',
  });
  /* eslint-disable no-console */
  console.log(`Wrote ${diff.length} method differences to ${outFile}`);
}

/**
 * By default, compares Looker API 3.1 beta endpoints with their 4.0 version and writes the
 * result to csv.
 */
(async () => {
  try {
    checkSpecs();
  } catch (err: unknown) {
    console.error(err);
  }
})();
