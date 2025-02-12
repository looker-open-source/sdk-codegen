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

import type { ArgValues } from '@looker/sdk-rtl';
import { codeGenerators } from '@looker/sdk-codegen';

export const allAlias = 'all';

/**
 * Gets all supported sdk languages
 * @returns mapping of sdk language aliases to name
 */
export const allSdkLanguages = (): Record<string, string> => {
  const languages: ArgValues = {};
  codeGenerators.forEach(gen => {
    const alias = (gen.extension.toString().match(/\.(\w+)\b/) ?? [])[1];
    languages[alias] = gen.language;
  });

  return { ...languages, [allAlias]: 'All' };
};

/**
 * Searches for sdk language details given label
 * @param label label to search by
 * @returns language name and alias
 */
export const findSdk = (label: string) => {
  const languages = allSdkLanguages();
  let match = { alias: allAlias, language: languages[allAlias] };
  for (const [alias, language] of Object.entries(languages)) {
    if (
      !label.localeCompare(alias, 'en', { sensitivity: 'base' }) ||
      !label.localeCompare(language, 'en', { sensitivity: 'base' })
    ) {
      match = { alias, language };
      break;
    }
  }
  return match;
};
