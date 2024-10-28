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

import type { IAPIMethods } from '@looker/sdk-rtl';
import type { ThemeOverrides } from './adaptorUtils';
import { getThemeOverrides } from './adaptorUtils';
import { BrowserAdaptor } from './browserAdaptor';

describe('BrowserAdaptor', () => {
  test.each([
    ['www.looker.com', getThemeOverrides(true)],
    ['www.google.com', getThemeOverrides(true)],
    ['localhost', getThemeOverrides(true)],
    ['127.0.0.1', getThemeOverrides(false)],
  ])(
    'returns correct font overrides',
    (hostname: string, expectedOverrides: ThemeOverrides) => {
      const saveLoc = window.location;
      delete (window as any).location;
      window.location = {
        ...saveLoc,
        hostname,
      };
      expect(new BrowserAdaptor({} as IAPIMethods).themeOverrides()).toEqual(
        expectedOverrides
      );
      window.location = saveLoc;
    }
  );

  const mockClipboardCopy = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  Object.assign(navigator, {
    clipboard: {
      writeText: mockClipboardCopy,
    },
  });

  test('copies location href to clipboard', async () => {
    jest.spyOn(navigator.clipboard, 'writeText');
    const adaptor = new BrowserAdaptor({} as IAPIMethods);
    await adaptor.copyToClipboard();
    expect(mockClipboardCopy).toHaveBeenCalledWith(location.href);
  });
});
