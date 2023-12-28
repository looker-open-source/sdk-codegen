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
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { api, api40 } from '../../test-data';
import { DocSummaryStatus } from './DocSummaryStatus';

describe('DocMethodSummaryStatus', () => {
  test.each`
    status          | method                              | expectedLabel        | expectedContent
    ${'beta'}       | ${api40.methods.invalidate_tokens}  | ${'beta item'}       | ${'This beta item is under development and subject to change.'}
    ${'stable'}     | ${api.methods.login}                | ${'stable item'}     | ${'This item is considered stable for this API version.'}
    ${'deprecated'} | ${api.methods.backup_configuration} | ${'deprecated item'} | ${'This item has been deprecated and will be removed in the future.'}
  `(
    'it renders an icon with a tooltip containing the right content for $status endpoints',
    async ({ method, expectedLabel, expectedContent }) => {
      renderWithTheme(<DocSummaryStatus status={method.status} />);
      const icon = screen.getByLabelText(expectedLabel);
      fireEvent.mouseOver(icon);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(expectedContent);
      });
    }
  );
});
