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
import React from 'react';
import { screen } from '@testing-library/react';
import { findExampleLanguages } from '@looker/sdk-codegen';

import { renderWithLode } from '../../test-utils';
import { api, examples } from '../../test-data';
import { DocSdkUsage } from './DocSdkUsage';
import {
  PER_PAGE_COUNT,
  getFileNameFromPath,
  prepareExampleDataTable,
  sortLanguagesByPreference,
} from './utils';

describe('DocSdkUsage', () => {
  test('it renders links to sdk examples', () => {
    const method = api.methods.run_look;
    const languages = findExampleLanguages(examples, method.name);
    const { pageExamples } = prepareExampleDataTable(
      languages,
      examples,
      method.operationId,
      1
    );
    renderWithLode(<DocSdkUsage method={method} />, examples);
    expect(screen.getAllByRole('link')).toHaveLength(PER_PAGE_COUNT);

    expect(
      screen.getAllByText(pageExamples[0].filename)[0].closest('a')
    ).toHaveAttribute('href', pageExamples[0].permalink);
  });
});

describe('DocSdkUsage utils', () => {
  test('preferred language examples come first', () => {
    expect(
      sortLanguagesByPreference(
        ['python', 'typescript', 'csharp'],
        'typescript'
      )
    ).toEqual(['typescript', 'python', 'csharp']);
  });

  test('can get filename from path', () => {
    expect(
      getFileNameFromPath('/sdk-codegen/packages/foo.py line 200')
    ).toEqual('foo.py');
  });
});
