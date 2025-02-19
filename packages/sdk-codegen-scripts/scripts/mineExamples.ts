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
import { ExampleMiner } from '../src/exampleMiner';
(() => {
  const args = process.argv.slice(2);
  const total = args.length;
  const root = path.join(__dirname, '/../../../');
  const sourcePath = total < 1 ? root : path.join(root, args[0]);
  const indexFile = path.join(sourcePath, '/examplesIndex.json');
  /* eslint-disable no-console */
  console.log(`Mining examples from ${sourcePath} ...`);
  const miner = new ExampleMiner(sourcePath);
  const result = miner.execute();
  fs.writeFileSync(indexFile, JSON.stringify(result, null, 2), {
    encoding: 'utf-8',
  });
  /* eslint-disable no-console */
  console.log(
    `${Object.entries(result.nuggets).length} nuggets written to ${indexFile}`
  );
})();
