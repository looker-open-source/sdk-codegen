/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { LookerNodeSDK } from '@looker/sdk-node';
import { renderDot } from 'render-dot';

const sdk = LookerNodeSDK.init40();

// returns an svg file with the pdt dependency graph viz
const getPDTGraph = async (modelname: string, filename: string) => {
  if (modelname) {
    const res = await sdk.ok(
      sdk.graph_derived_tables_for_model({ model: modelname })
    );
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const result = await renderDot({
      input: res.graph_text,
      format: 'svg',
    });
    const file = fs.writeFileSync(filename, result, 'binary');
    return file;
  } else {
    throw Error(
      `Model name not specified, please specifiy a model name to pull pdt dependency graph for.`
    );
  }
};

// Example
// getPDTGraph('pdtgraph')
