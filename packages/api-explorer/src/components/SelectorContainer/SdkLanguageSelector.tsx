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
import type { FC } from 'react'
import React, { useEffect } from 'react'
import { codeGenerators } from '@looker/sdk-codegen'
import { Select } from '@looker/components'
import { useSelector } from 'react-redux'
import type { SelectOptionProps } from '@looker/components'

import { useHistory } from 'react-router-dom'
import { useSettingActions, selectSdkLanguage } from '../../state'
import { useNavigation } from '../../utils'

/**
 * Allows the user to select their preferred SDK language
 */
export const SdkLanguageSelector: FC = () => {
  const history = useHistory()
  const navigate = useNavigation()
  const { setSdkLanguageAction } = useSettingActions()
  const selectedSdkLanguage = useSelector(selectSdkLanguage)
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

  const handleChange = (language: string) => {
    setSdkLanguageAction({ sdkLanguage: language })
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(history.location.search)
    const urlSdk = searchParams.get('sdk')
    const initSdk = urlSdk && urlSdk.toLowerCase() === 'csharp' ? 'C#' : urlSdk
    if (initSdk && allSdkLanguages.find((lang) => lang.value === initSdk)) {
      setSdkLanguageAction({ sdkLanguage: initSdk! })
    }
  }, [])

  useEffect(() => {
    const language =
      selectedSdkLanguage === 'C#' ? 'Csharp' : selectedSdkLanguage
    navigate(history.location.pathname, { sdk: language })
  }, [selectedSdkLanguage])

  return (
    <Select
      aria-label="sdk language selector"
      value={selectedSdkLanguage}
      onChange={handleChange}
      options={allSdkLanguages}
    />
  )
}
