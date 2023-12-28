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
import { screen, waitFor } from '@testing-library/react';
import type { IRawResponse } from '@looker/sdk-rtl';
import userEvent from '@testing-library/user-event';
import { ResponseExplorer, ResponseHeaders } from '.';

const response: IRawResponse = {
  method: 'GET',
  url: '/sample/url',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('plain text'),
  contentType: 'text/plain',
  headers: {
    'content-type': 'text/plain',
    link: 'nah, not really',
    'x-total-count': '0',
  },
  requestStarted: 1000,
  responseCompleted: 2000,
};

describe('ResponseExplorer', () => {
  test('renders response headers', async () => {
    renderWithTheme(<ResponseHeaders response={response} />);
    const heading = 'Headers (3)';
    const header = screen.getByText(heading);
    expect(header).toBeInTheDocument();
    await userEvent.click(header);
    await waitFor(() => {
      // TODO figure out a more specific selector?
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('content-type');
      expect(table).toHaveTextContent('text/plain');
      expect(table).toHaveTextContent('link');
      expect(table).toHaveTextContent('nah, not really');
      expect(table).toHaveTextContent('x-total-count');
      expect(table).toHaveTextContent('0');
    });
  });

  test('renders response body', async () => {
    renderWithTheme(
      <ResponseExplorer verb="GET" path="/test/path" response={response} />
    );
    expect(screen.getByText(response.body.toString())).toBeInTheDocument();
    const header = screen.getByRole('heading', { name: 'Body (10 bytes)' });
    await userEvent.click(header);
    await waitFor(() => {
      expect(
        screen.queryByText(response.body.toString())
      ).not.toBeInTheDocument();
    });
  });

  test('renders a message when no response is received', async () => {
    renderWithTheme(
      <ResponseExplorer verb="GET" path="/test/path" response={undefined} />
    );
    expect(screen.getByText('No response was received')).toBeInTheDocument();
  });
});
