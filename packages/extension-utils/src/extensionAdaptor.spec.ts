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
import type { ExtensionSDK, LookerHostData } from '@looker/extension-sdk';
import { ExtensionAdaptor } from './extensionAdaptor';
import type { ThemeOverrides } from '@looker/extension-utils';
import { getThemeOverrides } from '@looker/extension-utils';

describe('ExtensionAdaptor', () => {
  test.each([
    [undefined, getThemeOverrides(false)],
    ['standard', getThemeOverrides(true)],
    ['embed', getThemeOverrides(false)],
    ['spartan', getThemeOverrides(false)],
  ])(
    'returns correct font overrides',
    (hostType?: string, expectedOverrides?: ThemeOverrides) => {
      expect(
        new ExtensionAdaptor(
          {
            lookerHostData: {
              hostType,
            } as Readonly<LookerHostData>,
          } as ExtensionSDK,
          {} as IAPIMethods
        ).themeOverrides()
      ).toEqual(expectedOverrides);
    }
  );

  const adaptor = new ExtensionAdaptor(
    {
      lookerHostData: {} as Readonly<LookerHostData>,
    } as ExtensionSDK,
    {} as IAPIMethods
  );

  const mockClipboardWrite = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  Object.assign(adaptor, {
    extensionSdk: {
      clipboardWrite: mockClipboardWrite,
      lookerHostData: {
        hostOrigin: 'https://self-signed.looker.com:9999',
        extensionId: 'apix::api-explorer',
      },
    },
  });

  test('copies browser URL to clipboard', async () => {
    jest.spyOn(adaptor.extensionSdk, 'clipboardWrite');
    await adaptor.copyToClipboard(location);
    const testHostData = adaptor.extensionSdk.lookerHostData;
    const expectedClipboardContents = `${testHostData!.hostOrigin}/extensions/${
      testHostData!.extensionId
    }${location.pathname}${location.search}`;
    expect(mockClipboardWrite).toHaveBeenCalledWith(expectedClipboardContents);
  });
});
