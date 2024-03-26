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
import pick from 'lodash/pick';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { api } from '../../test-data';
import { renderWithRouterAndReduxProvider } from '../../test-utils';
import { SideNavTypeTags } from './SideNavTypeTags';

describe('SideNavTypeTags', () => {
  const tags = pick(api.typeTags, ['ApiAuth', 'Dashboard']);
  test('it renders a provided tag and its methods', async () => {
    renderWithRouterAndReduxProvider(
      <SideNavTypeTags tags={tags} specKey={'4.0'} />
    );
    const tag = screen.getByText('Dashboard');
    const tagContent = 'CreateDashboardFilter';
    expect(screen.queryByText(tagContent)).not.toBeInTheDocument();
    await userEvent.click(tag);
    expect(screen.getByText(tagContent)).toBeInTheDocument();
    const methods = screen.getAllByRole('link');
    expect(methods).toHaveLength(Object.keys(tags.Dashboard).length);
  });

  test('tags are rendered initially collapsed and expand when clicked', async () => {
    renderWithRouterAndReduxProvider(
      <SideNavTypeTags tags={tags} specKey={'4.0'} />
    );

    const allTags = screen.getAllByText(/ApiAuth|Dashboard/);
    expect(allTags).toHaveLength(2);
    expect(screen.queryByText('AccessToken')).not.toBeInTheDocument();
    expect(screen.queryByText('CreateDashboardFilter')).not.toBeInTheDocument();
    await userEvent.click(allTags[0]);
    expect(screen.getByText('AccessToken')).toBeInTheDocument();
    expect(screen.queryByText('CreateDashboardFilter')).not.toBeInTheDocument();
  });

  test('tag is expanded if specified in route', () => {
    const tags = pick(api.typeTags, ['ApiAuth', 'DataAction']);
    renderWithRouterAndReduxProvider(
      <SideNavTypeTags tags={tags} specKey={'4.0'} />,
      ['/4.0/types/DataAction']
    );

    const allTags = screen.getAllByText(/^(ApiAuth|DataAction)$/);
    expect(allTags).toHaveLength(2);
    expect(screen.queryByText('AccessToken')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(
      Object.keys(tags.DataAction).length
    );
  });
});
