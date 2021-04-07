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
import React, { FC } from 'react'
import { codeGenerators } from '@looker/sdk-codegen'
import { Select } from '@looker/components'
import { useSelector } from 'react-redux'
import { SelectOptionProps } from '@looker/components/lib/Form/Inputs/Select/SelectOptions'

import { useActions } from '../../hooks'
import { getDualModeConfigurator, getSelectedSdkLanguage } from '../../state'

/**
 * Allows the user to select their preferred language
 * @constructor
 */
export const SdkLanguageSelector: FC = () => {
  const { setSdkLanguageAction } = useActions()
  const configurator = useSelector(getDualModeConfigurator)
  const selectedSdkLanguage = useSelector(getSelectedSdkLanguage)

  const allSdkLanguages: SelectOptionProps[] = codeGenerators.map((gen) => ({
    value: gen.label || gen.language,
  }))

  allSdkLanguages.push({
    options: [
      {
        value: 'All',
      },
    ],
  })

  const handleChange = (language: string) => {
    setSdkLanguageAction(language)
    configurator.setLocalStorageItem('language', language)
  }

  return (
    <Select
      value={selectedSdkLanguage}
      onChange={handleChange}
      options={allSdkLanguages}
    />
  )
}
