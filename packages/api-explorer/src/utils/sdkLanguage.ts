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

import { codeGenerators } from '@looker/sdk-codegen'

export const allSdkLanguages = (): Record<string, string> => {
  const languages = {}
  codeGenerators.forEach((gen) => {
    const alias = gen.extension.toString().match(/\.(\w+)\b/)![1]
    languages[alias.toLowerCase()] = gen.language
  })

  return { ...languages, all: 'All' }
}

/**
 * Searches for sdk language name by alias
 * @param alias alias to search by
 * @returns language name
 */
export const getLanguageByAlias = (alias: string) => {
  const languages = allSdkLanguages()
  return languages[alias.toLowerCase()]
}

/**
 * Searches for alias by sdk language name
 * @param language name to search by
 * @returns alias
 */
export const getAliasByLanguage = (language: string) => {
  const languages = allSdkLanguages()
  const match = Object.keys(languages).find(
    (alias) => languages[alias].toLowerCase() === language.toLowerCase()
  )
  return match
}
