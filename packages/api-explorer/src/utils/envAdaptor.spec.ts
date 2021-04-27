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
import { StandaloneEnvAdaptor, ThemeOverrides } from './envAdaptor'

const googleFontOverrides = {
  loadGoogleFonts: true,
  themeCustomizations: {
    fontFamilies: { brand: 'Google Sans' },
    colors: { key: '#1A73E8' },
  },
}

describe('StandaloneEnvAdaptor', () => {
  test.each([
    ['www.looker.com', googleFontOverrides],
    ['www.google.com', googleFontOverrides],
    ['localhost', googleFontOverrides],
    ['127.0.0.1', {}],
  ])(
    'returns correct font overrides',
    (hostname: string, expectedOverrides: ThemeOverrides) => {
      const saveLoc = window.location
      delete (window as any).location
      window.location = {
        ...saveLoc,
        hostname,
      }
      expect(new StandaloneEnvAdaptor().themeOverrides()).toEqual(
        expectedOverrides
      )
      window.location = saveLoc
    }
  )
})
