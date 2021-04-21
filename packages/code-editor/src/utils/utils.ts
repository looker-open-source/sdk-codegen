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
import { theme } from '@looker/components'
import { Language, Prism } from 'prism-react-renderer'
import prismTheme from 'prism-react-renderer/themes/vsDark'

/**
 * checks whether object is Language
 * @param object any object to be tested
 * @returns boolean
 */
function instanceOfPrismLanguage(object: any): boolean {
  return Object.keys(Prism.languages).includes(object)
}

/**
 * gets highlighter language type for input language name
 * @param language sdk language to be highlighted
 * @returns prism language if it exists
 */
export const getPrismLanguage = (language: string): Language => {
  language = language.toLowerCase()
  const unstyled = ['kotlin', 'csharp', 'swift']
  // TODO revert back to `go` in generator language definitions instead of using this
  if (language === 'golang') {
    language = 'go'
  } else if (unstyled.includes(language)) {
    language = 'clike'
  }
  return instanceOfPrismLanguage(language) ? (language as Language) : 'json'
}

/**
 * applies package overrides to the default vsCode prism theme
 * @returns modified prism theme object
 */
export function getOverridenTheme(transparent: boolean) {
  if (transparent) {
    prismTheme.plain.backgroundColor = 'none'
    prismTheme.plain.padding = '0px'
  } else {
    prismTheme.plain.backgroundColor = theme.colors.text
    prismTheme.plain.padding = '1rem'
  }
  return prismTheme
}
