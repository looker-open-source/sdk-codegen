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
import { renderWithTheme } from '@looker/components-test-utils';

import { api } from '../../test-data';
import { DocParams } from './DocParams';

describe('DocParams', () => {
  test('it works when method only has required params', () => {
    const params = api.methods.create_connection.allParams;
    expect(params).toHaveLength(1);
    // eslint-disable-next-line jest-dom/prefer-required
    expect(params[0]).toHaveProperty('required', true);

    renderWithTheme(<DocParams parameters={params} />);
    expect(screen.getByText(params[0].name)).toBeInTheDocument();
  });

  test('it works when method only has optional params', () => {
    const params = api.methods.me.allParams;
    expect(params).toHaveLength(1);
    // eslint-disable-next-line jest-dom/prefer-required
    expect(params[0]).toHaveProperty('required', false);

    renderWithTheme(<DocParams parameters={params} />);
    expect(screen.getByText(`[${params[0].name}]`)).toBeInTheDocument();
  });

  test('it works when method has both required and optional params', () => {
    const params = api.methods.user.allParams;
    const requiredParams = params.filter((param) => param.required);
    const optionalParams = params.filter((param) => !param.required);
    expect(requiredParams).toHaveLength(1);
    expect(optionalParams).toHaveLength(1);

    renderWithTheme(<DocParams parameters={params} />);
    expect(screen.getByText(requiredParams[0].name)).toBeInTheDocument();
    expect(screen.getByText(`[${optionalParams[0].name}]`)).toBeInTheDocument();
  });
});
