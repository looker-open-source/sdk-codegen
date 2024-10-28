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
import { render, screen } from '@testing-library/react';
import { renderWithTheme } from '@looker/components-test-utils';
import type { IRawResponse } from '@looker/sdk-rtl';

import {
  testBogusJsonResponse,
  testErrorResponse,
  testHtmlResponse,
  testImageResponse,
  testJsonResponse,
  testOneRowComplexJson,
  testTextResponse,
  testUnknownResponse,
} from '../../test-data';
import { ShowResponse } from './ShowResponse';

describe('ShowResponse', () => {
  test('undefined response', () => {
    renderWithTheme(<ShowResponse response={{} as IRawResponse} />);
    expect(
      screen.getByText(
        'The response body could not be parsed. Displaying raw data.'
      )
    ).toBeInTheDocument();
  });

  test('it renders 2D json responses', () => {
    renderWithTheme(<ShowResponse response={testJsonResponse} />);
    const tab = screen.getByRole('tabpanel');
    expect(tab).toHaveTextContent('"key1"');
    expect(tab).toHaveTextContent('"value1"');
  });

  test('it renders no grid for one-row complex json', () => {
    renderWithTheme(<ShowResponse response={testOneRowComplexJson} />);
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    expect(screen.getByText('"fields"')).toBeInTheDocument();
    expect(screen.getByText('"orders.id"')).toBeInTheDocument();
  });

  test('it renders text responses', () => {
    renderWithTheme(<ShowResponse response={testTextResponse} />);
    expect(
      screen.getByText(testTextResponse.body.toString())
    ).toBeInTheDocument();
  });

  test('it renders html responses', () => {
    renderWithTheme(<ShowResponse response={testHtmlResponse} />);
    expect(screen.getByText('Orders Created Date')).toBeInTheDocument();
  });

  test('it renders png responses', () => {
    render(<ShowResponse response={testImageResponse()} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  test('it renders jpg responses', () => {
    render(<ShowResponse response={testImageResponse('image/jpeg')} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  test('it renders svg responses', () => {
    render(<ShowResponse response={testImageResponse('image/svg+xml')} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('it renders a message for unknown response types', () => {
    renderWithTheme(<ShowResponse response={testUnknownResponse} />);
    expect(
      screen.getByText(
        `Received ${testUnknownResponse.body.length} bytes of ${testUnknownResponse.contentType} data.`
      )
    ).toBeInTheDocument();
  });

  test('it renders an error for error responses', () => {
    renderWithTheme(<ShowResponse response={testErrorResponse} />);
    expect(
      screen.getByText(testErrorResponse.statusMessage, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(testErrorResponse.body.toString(), { exact: false })
    ).toBeInTheDocument();
  });

  test('it renders bogus json responses', () => {
    renderWithTheme(<ShowResponse response={testBogusJsonResponse} />);
    expect(
      screen.getByText(
        'The response body could not be parsed. Displaying raw data.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('I AM A LYING JSON RESPONSE')).toBeInTheDocument();
  });
});
