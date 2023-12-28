/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import { Text } from '@looker/components';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CollapserCard } from './CollapserCard';

describe('CollapserCard', () => {
  test('it renders heading, children and collapses', async () => {
    const heading = 'Foo';
    const childText = 'Bar';
    renderWithTheme(
      <CollapserCard heading={heading}>
        <Text>{childText}</Text>
      </CollapserCard>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
    const header = screen.getByText(heading);
    await userEvent.click(header);
    await waitFor(() => {
      expect(screen.queryByText(childText)).not.toBeInTheDocument();
    });
  });
  test('it renders heading, children but no divider', async () => {
    const heading = 'Foo';
    const childText = 'Bar';
    renderWithTheme(
      <CollapserCard heading={heading} divider={false}>
        <Text>{childText}</Text>
      </CollapserCard>
    );
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
    const header = screen.getByText(heading);
    await userEvent.click(header);
    await waitFor(() => {
      expect(screen.queryByText(childText)).not.toBeInTheDocument();
    });
  });
});
