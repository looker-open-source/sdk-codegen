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
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { allAlias, findSdk, isValidFilter, useNavigation } from '../index'
import {
  selectSdkLanguage,
  selectTagFilter,
  useSettingActions,
  useSettingStoreState,
} from '../../state'

/**
 * Hook for syncing URL params with the Redux store
 */

export const useGlobalSync = () => {
  const location = useLocation()
  const navigate = useNavigation()
  const { setSdkLanguageAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedSdkLanguage = useSelector(selectSdkLanguage)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (initialized) {
      const searchParams = new URLSearchParams(location.search)
      const sdkParam = searchParams.get('sdk') || ''
      const sdk = findSdk(sdkParam)
      const validSdkParam =
        !sdkParam.localeCompare(sdk.alias, 'en', { sensitivity: 'base' }) ||
        !sdkParam.localeCompare(sdk.language, 'en', { sensitivity: 'base' })

      if (validSdkParam) {
        // sync store with URL
        setSdkLanguageAction({
          sdkLanguage: sdk.language,
        })
      } else {
        // sync URL with store
        const { alias } = findSdk(selectedSdkLanguage)
        navigate(location.pathname, {
          sdk: alias === allAlias ? null : alias,
        })
      }

      setSynced(true)
    }
  }, [initialized])

  return synced
}

/**
 * Hook for syncing URL params with the Redux store
 */
export const useTagSceneSync = () => {
  console.log('started executing hook')
  const location = useLocation()
  const navigate = useNavigation()
  const { setTagFilterAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedTagFilter = useSelector(selectTagFilter)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (initialized) {
      console.log('running initialization sync')
      const searchParams = new URLSearchParams(location.search)
      const verbParam = searchParams.get('v') || 'ALL'
      const validVerbParam = isValidFilter(location, verbParam)

      if (validVerbParam) {
        setTagFilterAction({ tagFilter: verbParam.toUpperCase() })
      } else {
        navigate(location.pathname, {
          v:
            selectedTagFilter === 'ALL'
              ? null
              : selectedTagFilter.toLowerCase(),
        })
      }
      setSynced(true)
    }
  }, [initialized])

  console.log('synced will return: ', synced)

  return synced
}
