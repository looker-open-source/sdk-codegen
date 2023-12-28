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
import { methodRefs, typeRefs } from '@looker/sdk-codegen';
import { screen } from '@testing-library/react';

import {
  createTestStore,
  renderWithRouterAndReduxProvider,
} from '../../test-utils';
import { api } from '../../test-data';
import { buildPath } from '../../utils';
import { DocReferences } from './DocReferences';

describe('DocReferences', () => {
  test('it renders method and type references', () => {
    const typesUsed = typeRefs(api, api.types.DashboardElement.customTypes);
    const typesUsedBy = typeRefs(api, api.types.DashboardElement.parentTypes);
    const methodsUsedBy = methodRefs(
      api,
      api.types.DashboardElement.methodRefs
    );
    renderWithRouterAndReduxProvider(
      <DocReferences
        typesUsed={typesUsed}
        typesUsedBy={typesUsedBy}
        methodsUsedBy={methodsUsedBy}
        specKey={'4.0'}
        api={api}
      />
    );
    expect(screen.getAllByRole('link')).toHaveLength(
      typesUsed.length + typesUsedBy.length + methodsUsedBy.length
    );
    expect(screen.getByText(typesUsed[0].name).closest('a')).toHaveAttribute(
      'href',
      buildPath(api, typesUsed[0], '4.0')
    );

    expect(typesUsedBy).toHaveLength(1);
    expect(typesUsedBy[0].name).toEqual('Dashboard');
    expect(screen.getByText(typesUsedBy[0].name).closest('a')).toHaveAttribute(
      'href',
      buildPath(api, typesUsedBy[0], '4.0')
    );
    expect(
      screen.getByText(methodsUsedBy[0].name).closest('a')
    ).toHaveAttribute('href', buildPath(api, methodsUsedBy[0], '4.0'));
  });

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'dash';
    const store = createTestStore({
      settings: { searchPattern: highlightPattern },
    });
    renderWithRouterAndReduxProvider(
      <DocReferences
        typesUsed={[api.types.Dashboard]}
        specKey={'4.0'}
        api={api}
      />,
      undefined,
      store
    );
    const foundRef = screen.getByRole('link');
    expect(foundRef).toContainHTML('<span class="hi">Dash</span>board');
    expect(foundRef).toHaveAttribute(
      'href',
      buildPath(api, api.types.Dashboard, '4.0')
    );
  });
});
