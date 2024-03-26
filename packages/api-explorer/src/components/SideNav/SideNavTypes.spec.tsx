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

import userEvent from '@testing-library/user-event';
import { api } from '../../test-data';
import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../test-utils';
import { SideNavTypes } from './SideNavTypes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => {
  const ReactRouterDOM = jest.requireActual('react-router-dom');
  return {
    ...ReactRouterDOM,
    useHistory: () => ({
      push: mockHistoryPush,
      location: globalThis.location,
    }),
  };
});

describe('SideNavTypes', () => {
  const tag = 'Dashboard';
  const specKey = '4.0';
  const typeTags = Object.keys(api.typeTags[tag]);

  test('it renders provided types', () => {
    renderWithRouterAndReduxProvider(
      <SideNavTypes specKey={specKey} types={{ ...api.types }} tag={tag} />
    );
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(tag);
  });

  test('tag expands and displays types after clicked', async () => {
    renderWithRouterAndReduxProvider(
      <SideNavTypes types={{ ...api.types }} tag={tag} specKey={specKey} />
    );
    expect(screen.queryByText(typeTags[0])).not.toBeInTheDocument();
    await userEvent.click(screen.getByText(tag));
    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: `/${specKey}/types/${tag}`,
      search: '',
    });
    expect(screen.getByRole('link', { name: typeTags[0] })).toBeInTheDocument();
  });

  test('expanded tag closes when clicked', async () => {
    renderWithRouterAndReduxProvider(
      <SideNavTypes
        types={{ ...api.types }}
        tag={tag}
        specKey={specKey}
        defaultOpen={true}
      />
    );
    expect(screen.getByRole('link', { name: typeTags[0] })).toBeInTheDocument();
    await userEvent.click(screen.getAllByText(tag)[0]);
    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: `/${specKey}/types`,
      search: '',
    });
    expect(
      screen.queryByRole('link', { name: typeTags[0] })
    ).not.toBeInTheDocument();
  });

  test('it highlights text matching search pattern', () => {
    const store = createTestStore({ settings: { searchPattern: 'dash' } });
    renderWithRouterAndReduxProvider(
      <SideNavTypes
        specKey={specKey}
        types={{
          ...api.types,
        }}
        tag={tag}
      />,
      undefined,
      store
    );
    const match = screen.getByText(/dash/i);
    expect(match).toContainHTML('<span class="hi">Dash</span>');
  });
});
