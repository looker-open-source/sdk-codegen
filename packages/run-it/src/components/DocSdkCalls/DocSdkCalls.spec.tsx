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
import { renderWithTheme } from '@looker/components-test-utils';
import { screen } from '@testing-library/react';
import { codeGenerators } from '@looker/sdk-codegen';

import { api } from '../../test-data';
import { DocSdkCalls } from './DocSdkCalls';

describe('DocSdkCalls', () => {
  const supportedLanguages = codeGenerators.map((g) => g.language);
  const pattern = new RegExp(`${supportedLanguages.join('|')}`);

  test('it can render SDK call syntax for all supported languages', () => {
    renderWithTheme(
      <DocSdkCalls
        api={api}
        method={api.methods.user}
        inputs={{ user_id: 1 }}
        sdkLanguage="All"
      />
    );
    expect(
      screen.getByRole('heading', { name: 'SDKs call syntax' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('tab', {
        name: pattern,
      })
    ).toHaveLength(supportedLanguages.length);
  });

  test.each(supportedLanguages)(
    'it can render a %s method declaration',
    (sdkLanguage) => {
      renderWithTheme(
        <DocSdkCalls
          api={api}
          method={api.methods.user}
          inputs={{ user_id: 1 }}
          sdkLanguage={sdkLanguage}
        />
      );
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: `${sdkLanguage} SDK call syntax` })
      ).toBeInTheDocument();
    }
  );

  test('shows useful message when it errors while parsing complex structures', () => {
    renderWithTheme(
      <DocSdkCalls
        api={api}
        method={api.methods.run_inline_query}
        inputs={{
          body: '{\n  "k1": "v1",\n',
        }}
        sdkLanguage="All"
      />
    );
    expect(
      screen.getByText(
        'Cannot generate SDK call syntax. Ensure all complex structures in the request form are valid.'
      )
    ).toBeInTheDocument();
  });
});
