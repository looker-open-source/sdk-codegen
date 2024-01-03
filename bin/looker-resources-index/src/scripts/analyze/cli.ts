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

/* eslint no-console: "off" */

import { resources } from '../../resource-data/resources';

import * as analyze from './index';

report();

function report() {
  const results: Record<string, any> = {};

  results.missingLanguages = analyze.missingLanguages(resources);
  if (results.missingLanguages.actionItems.length > 0) {
    console.log('\n### Missing Languages ###\n');
    console.log(results.missingLanguages.actionItems.join('\n'));
  }

  results.missingPersonas = analyze.missingPersonas(resources);
  if (results.missingPersonas.actionItems.length > 0) {
    console.log('\n### Missing Personas ###\n');
    console.log(results.missingPersonas.actionItems.join('\n'));
  }

  console.log('\n### Platform Feature x Content Type Coverage Matrix ###\n');
  results.platformFeatureXContentType =
    analyze.platformFeatureXContentType(resources);
  console.table(results.platformFeatureXContentType.table);

  console.log('\n### Summary ###\n');
  Object.values(results)
    .filter(r => r.summary)
    .forEach(r => console.log(r.summary));
}
