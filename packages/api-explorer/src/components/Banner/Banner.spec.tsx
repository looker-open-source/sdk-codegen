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
import { screen, fireEvent, waitFor } from '@testing-library/react';
import type { IEnvironmentAdaptor } from '@looker/extension-utils';
import type { SpecList } from '@looker/sdk-codegen';
import { Banner } from './Banner';

describe('Banner', () => {
  const specs: any = {
    '3.1': {
      status: 'current',
    },
    '4.0': {
      status: 'beta',
    },
  };

  test('renders with button that opens api 4.0 dev portal link in new page', async () => {
    const adaptor: any = {
      localStorageGetItem: jest.fn().mockReturnValue(Promise.resolve(null)),
      isExtension: jest.fn().mockReturnValue(true),
    };
    renderWithTheme(
      <Banner
        adaptor={adaptor as IEnvironmentAdaptor}
        specs={specs as SpecList}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('API 4.0 moves from Beta', { exact: false })
      ).toBeInTheDocument();
      const link = screen.getByText('Announcement').closest('a');
      expect(link).toHaveAttribute(
        'href',
        'https://developers.looker.com/api/advanced-usage/version-4-ga'
      );
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  test('sets local storage value and unrenders on close button click', async () => {
    const adaptor: any = {
      localStorageGetItem: jest.fn().mockReturnValue(Promise.resolve(null)),
      localStorageSetItem: jest.fn(),
      isExtension: jest.fn().mockReturnValue(true),
    };

    renderWithTheme(
      <Banner
        adaptor={adaptor as IEnvironmentAdaptor}
        specs={specs as SpecList}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('API 4.0 moves from Beta', { exact: false })
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Dismiss Inform').closest('button');
    fireEvent.click(closeButton as HTMLButtonElement);

    expect(
      screen.queryByText('API 4.0 moves from Beta', { exact: false })
    ).not.toBeInTheDocument();
    expect(adaptor.localStorageSetItem).toHaveBeenCalledWith(
      'api-40-ga-apix-banner',
      'dismissed'
    );
  });
});
