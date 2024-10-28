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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useHistory } from 'react-router-dom';
import { getLoadedSpecs, specs } from '../../test-data';
import {
  renderWithReduxProvider,
  renderWithRouterAndReduxProvider,
} from '../../test-utils';
import { ApiSpecSelector } from './ApiSpecSelector';

jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom');
  return {
    ...ReactRouterDOM,
    useLocation: () => ({
      pathname: '/4.0/methods/Dashboard/dashboard',
    }),
    useHistory: jest
      .fn()
      .mockReturnValue({ push: jest.fn(), location: globalThis.location }),
  };
});

// jest.mock('../../state/specs', () => ({
//   ...(jest.requireActual('../../state/specs') as Record<string, unknown>),
//   useSpecActions: jest
//     .fn()
//     .mockReturnValue({ setCurrentSpecAction: jest.fn() }),
// }))

describe('ApiSpecSelector', () => {
  Element.prototype.scrollIntoView = jest.fn();
  const spec = getLoadedSpecs()['4.0'];

  test('the base spec is selected by default', () => {
    renderWithReduxProvider(<ApiSpecSelector spec={spec} />);
    const selector = screen.getByRole('textbox');
    expect(selector).toHaveValue(`${spec.key}`);
  });

  test('it lists all available specs', async () => {
    renderWithReduxProvider(<ApiSpecSelector spec={spec} />);
    userEvent.click(screen.getByRole('textbox'));
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(
        Object.keys(specs).length
      );
    });
  });

  test.skip('requests selected spec', async () => {
    const { push } = useHistory();
    renderWithRouterAndReduxProvider(<ApiSpecSelector spec={spec} />);
    userEvent.click(screen.getByRole('textbox'));
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(
        Object.keys(specs).length
      );
    });
    const button = screen.getByText('4.0');
    userEvent.click(button);
    expect(push).toHaveBeenCalledWith({
      pathname: '/4.0/methods/Dashboard/dashboard',
      search: '',
    });
  });
});
