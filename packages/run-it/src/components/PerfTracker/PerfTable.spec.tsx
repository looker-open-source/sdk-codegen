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

import { renderWithTheme } from '@looker/components-test-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { mockPerfEntries } from './PerfTracker.spec';
import { PerfTable } from './PerfTable';

const mockSelect = jest.fn();

describe('PerfTable', () => {
  test('it displays all items if requested', () => {
    renderWithTheme(
      <PerfTable
        showAllColumns={true}
        onSelect={mockSelect}
        data={mockPerfEntries}
      />
    );
    expect(screen.getByText(/Domain/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure/i)).toBeInTheDocument();

    // Check the partial url is in PerfTable
    const url = new URL(mockPerfEntries[1].name);
    const path = `${url.pathname}${url.search}`;
    expect(screen.getByText(path)).toBeInTheDocument();
  });
  test('it skips some columns by default', () => {
    renderWithTheme(<PerfTable onSelect={mockSelect} data={mockPerfEntries} />);
    expect(screen.queryByText(/Domain/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connect/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Secure/i)).not.toBeInTheDocument();

    // Check the partial url is in PerfTable
    const url = new URL(mockPerfEntries[1].name);
    const path = `${url.pathname}${url.search}`;
    expect(screen.getByText(path)).toBeInTheDocument();
  });
});
