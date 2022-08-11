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
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { allAlias, findSdk, useNavigation } from '../index'
import {
  selectSdkLanguage,
  selectSearchPattern,
  useSettingActions,
  useSettingStoreState,
} from '../../state'

/**
 * Hook for syncing global URL params with the Redux store
 * Global search parameters: 's', 'sdk'
 */

export const useGlobalStoreSync = () => {
  const location = useLocation()
  const { navigate } = useNavigation()
  const { setSdkLanguageAction, setSearchPatternAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedSdkLanguage = useSelector(selectSdkLanguage)
  const selectedSearchPattern = useSelector(selectSearchPattern)

  useEffect(() => {
    if (initialized) {
      const params = new URLSearchParams(location.search)

      // syncing search query
      const searchParam = params.get('s')
      if (searchParam) {
        setSearchPatternAction({
          searchPattern: searchParam,
        })
      } else {
        navigate(location.pathname, {
          s: selectedSearchPattern || null,
        })
      }

      // syncing SDK language selection
      const sdkParam = params.get('sdk') || ''
      const sdk = findSdk(sdkParam)
      const validSdkParam =
        !sdkParam.localeCompare(sdk.alias, 'en', { sensitivity: 'base' }) ||
        !sdkParam.localeCompare(sdk.language, 'en', { sensitivity: 'base' })
      if (validSdkParam) {
        setSdkLanguageAction({
          sdkLanguage: sdk.language,
        })
      } else {
        const { alias } = findSdk(selectedSdkLanguage)
        navigate(location.pathname, {
          sdk: alias === allAlias ? null : alias,
        })
      }
    }
  }, [initialized])
}
