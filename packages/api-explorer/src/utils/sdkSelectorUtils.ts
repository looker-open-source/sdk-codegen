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
import type { SelectOptionProps } from '@looker/components'

/**
 * @returns array containing all available SDK languages from codeGenerators
 */
export const getAllSdkLanguages = () => {
  const allSdkLanguages: SelectOptionProps[] = codeGenerators.map((gen) => ({
    value: gen.language,
  }))
  allSdkLanguages.push({
    options: [
      {
        value: 'All',
      },
    ],
  })
  return allSdkLanguages
}

/**
 * @returns array of objects with SDK language name and extension abbreviation
 */
export const getSdkNameAbbreviations = () => {
  const regex = /\.(\w+)\b/
  const sdkLanguageAbbreviations: { language: string; abbreviation: string }[] =
    codeGenerators.map((gen) => ({
      language: gen.language,
      abbreviation: gen.extension.toString().match(regex)![1],
    }))
  sdkLanguageAbbreviations.push({ language: 'All', abbreviation: 'all' })
  return sdkLanguageAbbreviations
}

/**
 * Given full SDK language name, returns an object containing the SDK name and abbreviation
 * @param name
 */
export const getSdkDetailsFromName = (name: string) => {
  const sdkNameDetails = getSdkNameAbbreviations()
  return sdkNameDetails.find(
    ({ language }) => language.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Given SDK language abbreviation, returns an object containing the SDK name and abbreviation
 * @param abbrev
 */
export const getSdkDetailsFromAbbrev = (abbrev: string) => {
  const sdkNameDetails = getSdkNameAbbreviations()
  return sdkNameDetails.find(
    ({ abbreviation }) => abbreviation === abbrev.toLowerCase()
  )
}
