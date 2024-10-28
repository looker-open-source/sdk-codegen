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
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from '@looker/components-test-utils';
import userEvent from '@testing-library/user-event';
import {
  BrowserAdaptor,
  registerTestEnvAdaptor,
} from '@looker/extension-utils';

import { initRunItSdk } from '../..';
import { ConfigForm, RunItConfigKey } from '.';

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

describe('ConfigForm', () => {
  const adaptor = new BrowserAdaptor(initRunItSdk());
  registerTestEnvAdaptor(adaptor);

  const apiLabel = /API server URL/i;
  const authLabel = /OAuth server URL/i;
  beforeEach(() => {
    localStorage.removeItem(RunItConfigKey);
  });

  test('it creates an empty config form without stored config', async () => {
    renderWithTheme(<ConfigForm requestContent={{}} />);
    expect(
      screen.getByRole('heading', { name: 'RunIt Configuration' })
    ).toBeInTheDocument();

    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement;
    expect(apiUrl).toBeInTheDocument();
    expect(apiUrl).toHaveValue('');

    const authUrl = screen.getByRole('textbox', {
      name: authLabel,
    }) as HTMLInputElement;
    expect(authUrl).toBeInTheDocument();
    expect(authUrl).toHaveValue('');

    expect(
      screen.getByRole('button', {
        name: 'Clear',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Verify',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Save',
      })
    ).toBeInTheDocument();
  });

  test('it disables and enables verify for bad and good urls', async () => {
    renderWithTheme(<ConfigForm requestContent={{}} />);
    const apiUrl = screen.getByRole('textbox', {
      name: apiLabel,
    }) as HTMLInputElement;
    expect(apiUrl).toBeInTheDocument();
    expect(apiUrl).toHaveValue('');

    await userEvent.type(apiUrl, 'bad');
    let button = screen.getByRole('button', {
      name: 'Verify',
    }) as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByText(`'bad' is not a valid url`)).toBeInTheDocument();

    fireEvent.change(apiUrl, { target: { value: '' } });
    await userEvent.type(apiUrl, 'https:good');
    expect(apiUrl).toHaveValue('https://good');
    button = screen.getByRole('button', {
      name: 'Verify',
    }) as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('it can have a custom title', () => {
    const title = 'New title';
    renderWithTheme(<ConfigForm title={title} requestContent={{}} />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  describe('storage', () => {
    test.skip('it saves and clears storage', async () => {
      // TODO need to rewrite this test
      renderWithTheme(<ConfigForm requestContent={{}} />);
      const apiUrl = screen.getByRole('textbox', {
        name: apiLabel,
      }) as HTMLInputElement;
      expect(apiUrl).toBeInTheDocument();
      expect(apiUrl).toHaveValue('');

      const authUrl = screen.getByRole('textbox', {
        name: authLabel,
      }) as HTMLInputElement;
      expect(authUrl).toBeInTheDocument();
      expect(authUrl).toHaveValue('');

      const save = screen.getByRole('button', {
        name: 'Save',
      }) as HTMLButtonElement;
      expect(save).toBeInTheDocument();

      const remove = screen.getByRole('button', {
        name: 'Remove',
      }) as HTMLButtonElement;
      expect(remove).toBeInTheDocument();

      await userEvent.type(apiUrl, 'https://foo:199');
      await userEvent.click(save);
      const value = localStorage.getItem(RunItConfigKey);
      expect(value).toBeDefined();
      expect(JSON.parse(value!)).toEqual({
        base_url: 'https://foo:199',
        looker_url: 'https://foo:99',
      });

      await userEvent.click(remove);
      const val = localStorage.getItem(RunItConfigKey);
      expect(val).toBeEmpty();
    });

    test('it shows login section when configured', async () => {
      localStorage.setItem(
        RunItConfigKey,
        JSON.stringify({
          base_url: 'http://locb',
          looker_url: 'http://local',
        })
      );

      renderWithTheme(<ConfigForm requestContent={{}} />);
      expect(
        screen.getByRole('heading', { name: 'RunIt Configuration' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', {
          name: 'Login',
        })
      ).toBeInTheDocument();
    });
  });
});
