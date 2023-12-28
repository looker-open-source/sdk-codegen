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
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '@looker/components-test-utils';
import { SelectTheme } from './SelectTheme';
import { useThemeActions, useThemesStoreState } from './state';

jest.mock('./state', () => ({
  ...jest.requireActual('./state'),
  useThemeActions: jest.fn(),
  useThemesStoreState: jest.fn(),
}));

describe('SelectTheme', () => {
  const lookerTheme = { id: '1', name: 'Looker' };
  const customTheme1 = { id: '2', name: 'custom_theme_1' };
  const customTheme2 = { id: '3', name: 'custom_theme_2' };
  const selectedTheme = lookerTheme;
  const themes = [lookerTheme, customTheme1, customTheme2];

  const getMockStoreState = (overrides: Record<string, any> = {}) => ({
    initialized: true,
    selectedTheme,
    themes,
    defaultTheme: lookerTheme,
    ...overrides,
  });

  const initActionSpy = jest.fn();
  const loadThemeDataActionSpy = jest.fn();
  const selectThemeActionSpy = jest.fn();

  beforeEach(() => {
    (useThemeActions as jest.Mock).mockReturnValue({
      initAction: initActionSpy,
      loadThemeDataAction: loadThemeDataActionSpy,
      selectThemeAction: selectThemeActionSpy,
    });
    (useThemesStoreState as jest.Mock).mockReturnValue(getMockStoreState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the default theme selected', async () => {
    renderWithTheme(<SelectTheme />);

    expect(initActionSpy).toHaveBeenCalled();
    expect(loadThemeDataActionSpy).toHaveBeenCalled();
    expect(selectThemeActionSpy).not.toHaveBeenCalled();

    const selector = screen.getByRole('textbox');
    expect(selector).toHaveValue(lookerTheme.name);

    userEvent.click(selector);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(themes.length);
      expect(
        screen.getByRole('option', { name: customTheme1.name })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: customTheme2.name })
      ).toBeInTheDocument();
    });
  });

  it('selects on select', async () => {
    renderWithTheme(<SelectTheme />);

    const selector = screen.getByRole('textbox');
    expect(selector).toHaveValue(lookerTheme.name);

    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    fireEvent.click(selector);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(themes.length);
    });

    const anotherTheme = screen.getByRole('option', {
      name: customTheme1.name,
    });

    // Using fireEvent here because userEvent was causing overlapping act warnings
    fireEvent.click(anotherTheme);

    await waitFor(() => {
      expect(selectThemeActionSpy).toHaveBeenCalledWith({
        key: customTheme1.id,
      });
    });
  });

  it('is disabled when only one theme is available', () => {
    (useThemesStoreState as jest.Mock).mockReturnValue(
      getMockStoreState({
        selectedTheme: lookerTheme,
        themes: [lookerTheme],
        defaultTheme: lookerTheme,
      })
    );

    renderWithTheme(<SelectTheme />);

    const selector = screen.getByRole('textbox');
    expect(selector).toHaveValue(lookerTheme.name);
    expect(selector).toBeDisabled();
  });

  it('renders an error if present', () => {
    (useThemesStoreState as jest.Mock).mockReturnValue(
      getMockStoreState({
        selectedTheme: {},
        themes: [],
        defaultTheme: {},
        error: 'Failed to fetch themes',
      })
    );

    renderWithTheme(<SelectTheme />);

    expect(screen.getByText('Failed to fetch themes')).toBeInTheDocument();
  });
});
