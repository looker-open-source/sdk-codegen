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
import { NodeSettingsIniFile } from '@looker/sdk-node';
import {
  DeclarationMiner,
  rubyMethodProbe,
  rubyTypeProbe,
} from '../src/declarationMiner';
(() => {
  const args = process.argv.slice(2);
  const total = args.length;
  const root = path.join(__dirname, '/../../../');
  const indexName = `declarationsIndex.json`;
  let sourcePath = '';
  let copyPath = '';
  let originOverride = '';
  if (total > 0) {
    sourcePath = path.join(root, args[0]);
    if (total > 1) {
      copyPath = path.join(root, args[1]);
    }
  } else {
    try {
      const settings = new NodeSettingsIniFile(
        '',
        path.join(root, 'looker.ini'),
        'Miner'
      ).readConfig();
      sourcePath = path.join(root, settings.base_url);
      if (settings.copy_path) {
        copyPath = path.join(root, settings.copy_path);
      }
      if (settings.origin_override) {
        originOverride = settings.origin_override;
      }
    } catch (e) {
      console.error(
        'A source path is required. Specify it with "base_url" in the Miner section in looker.ini or pass it as an argument'
      );
      process.exit(1);
    }
  }
  const indexFile = path.join(root, indexName);
  console.log(`Mining declarations from ${sourcePath} ...`);

  const miner = new DeclarationMiner(
    sourcePath,
    rubyMethodProbe,
    rubyTypeProbe,
    originOverride
  );
  const result = miner.execute();
  fs.writeFileSync(indexFile, JSON.stringify(result, null, 2), {
    encoding: 'utf-8',
  });
  console.log(
    `${
      Object.entries(result.methods).length +
      Object.entries(result.types).length
    } nuggets written to ${indexFile}`
  );
  if (copyPath) {
    const indexCopy = path.join(copyPath, indexName);
    fs.writeFileSync(indexCopy, JSON.stringify(result, null, 2), {
      encoding: 'utf-8',
    });
    console.log(`Copied declaration nuggets to ${indexCopy}`);
    const examplesIndex = 'examplesIndex.json';
    const examples = path.join(root, examplesIndex);
    if (fs.existsSync(examples)) {
      const examplesCopy = path.join(copyPath, examplesIndex);
      fs.copyFileSync(examples, examplesCopy);
      console.log(`Copied example nuggets to ${examplesCopy}`);
    }
  }
})();
