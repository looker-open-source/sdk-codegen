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

import type { IDeclarationMine, IExampleMine } from '@looker/sdk-codegen';

export const apixFilesHost = 'http://localhost:30000';

const fetchLode = async (lodeUrl: string) => {
  try {
    const result = await fetch(lodeUrl, { mode: 'cors' });
    return result.text();
  } catch (error) {
    return '';
  }
};

interface FullLode {
  examples?: IExampleMine;
  declarations?: IDeclarationMine;
}

export const getLoded = async (
  examplesLodeUrl?: string,
  declarationsLodeUrl?: string
): Promise<FullLode> => {
  // First try to load from the apix-files server
  let examples = await fetchLode(`${apixFilesHost}/examplesIndex.json`);
  if (!examples && examplesLodeUrl) {
    examples = await fetchLode(examplesLodeUrl);
  }

  let declarations;
  if (declarationsLodeUrl) {
    declarations = await fetchLode(declarationsLodeUrl);
  }

  const lode: FullLode = { examples: undefined, declarations: undefined };
  if (examples) {
    lode.examples = JSON.parse(examples);
  }
  if (declarations) {
    lode.declarations = JSON.parse(declarations);
  }
  return lode;
};
