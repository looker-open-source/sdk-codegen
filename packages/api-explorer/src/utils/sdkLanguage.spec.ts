/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import { codeGenerators } from '@looker/sdk-codegen'
import {
  allSdkLanguages,
  getAliasByLanguage,
  getLanguageByAlias,
} from '../utils'
import { languageAliases, languages, sdkLanguageMapping } from '../test-data'

describe('SDK Language Utils', () => {
  test('allSdkLanguages gets all sdk languages', () => {
    const actual = allSdkLanguages()
    const aliases = Object.keys(actual)
    expect(Object.keys(actual)).toHaveLength(codeGenerators.length + 1)
    aliases.forEach((alias) =>
      expect(actual[alias]).toEqual(sdkLanguageMapping[alias])
    )
  })

  test.each(languageAliases)(
    `getLanguageByAlias finds language for alias %s`,
    (alias) => {
      const actual = getLanguageByAlias(alias)
      expect(actual).toEqual(sdkLanguageMapping[alias])
    }
  )

  test('getLanguageByAlias is not case sensitive', () => {
    const actual = getLanguageByAlias('pY')
    expect(actual).toEqual('Python')
  })

  test.each(languages)(
    `getAliasByLanguage finds alias for language %s`,
    (language) => {
      const actual = getAliasByLanguage(language)
      const expected = Object.entries(sdkLanguageMapping).find(
        ([, v]) => v === language
      )
      expect(actual).toEqual(expected![0])
    }
  )

  test('getAliasByLanguage is not case sensitive', () => {
    const actual = getAliasByLanguage('pYtHon')
    expect(actual).toEqual('py')
  })
})
