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
import React from 'react';
import { screen } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';

const ErrorComp = ({ text }: { text: string }) => {
  const terminateWithPrejudice = () => {
    const badObj: any = {};
    return badObj.a.b;
  };
  return <div>{text + terminateWithPrejudice()}</div>;
};

describe('ErrorBoundary', () => {
  const header = 'Uh oh! Something went wrong!';
  const actionMessage = 'Try refreshing the page to correct the problem.';
  const childText = 'Sweet Child';

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('should render child component', () => {
    const logError = jest.fn();
    renderWithTheme(
      <ErrorBoundary logError={logError}>
        <div>{childText}</div>
      </ErrorBoundary>
    );
    expect(screen.queryByText(header)).not.toBeInTheDocument();
    expect(screen.queryByText(actionMessage)).not.toBeInTheDocument();
    expect(screen.getByText(childText)).toBeVisible();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should render error detail on error', () => {
    const logError = jest.fn();
    renderWithTheme(
      <ErrorBoundary logError={logError}>
        <ErrorComp text={childText} />
      </ErrorBoundary>
    );
    expect(screen.queryByText(childText)).not.toBeInTheDocument();
    expect(screen.getByText(header)).toBeVisible();
    expect(screen.getByText(actionMessage)).toBeVisible();
    expect(logError).toHaveBeenCalled();
  });
});
