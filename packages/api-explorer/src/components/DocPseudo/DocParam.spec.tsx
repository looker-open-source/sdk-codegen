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
import { describeParam } from '@looker/sdk-codegen';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { api } from '../../test-data';
import { DocParam } from './DocParam';

describe('DocParam', () => {
  const allParams = api.methods.run_look.allParams;
  const optionalParam = allParams.filter(val => !val.required)[0];
  const requiredParam = allParams.filter(val => val.required)[0];

  test('it renders', () => {
    renderWithTheme(<DocParam parameter={requiredParam} />);
    expect(screen.getByText(requiredParam.name)).toBeInTheDocument();
  });

  test('it renders required params with a tooltip', async () => {
    renderWithTheme(<DocParam parameter={requiredParam} />);
    const arg = screen.getByText(requiredParam.name);
    fireEvent.mouseOver(arg);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        `${requiredParam.type.name} ${describeParam(requiredParam)}`
      );
    });
  });

  test('optional params in square brackets', () => {
    renderWithTheme(<DocParam parameter={optionalParam} />);
    expect(screen.getByText(`[${optionalParam.name}]`)).toBeInTheDocument();
  });
});
