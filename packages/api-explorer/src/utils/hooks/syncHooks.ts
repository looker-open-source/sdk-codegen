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
  selectSearchPattern,
  selectTagFilter,
  useSettingActions,
  useSettingStoreState,
} from '../../state'

/**
 * Hook for syncing global URL params with the Redux store
 */

export const useGlobalSync = () => {
  const location = useLocation()
  const navigate = useNavigation()
  const { setSdkLanguageAction, setSearchPatternAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedSdkLanguage = useSelector(selectSdkLanguage)
  const selectedSearchPattern = useSelector(selectSearchPattern)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (initialized) {
      console.log('inside global sync initialization')
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

      // TODO: syncing the search (and additional) parameter without bloating code?
      const searchQueryParam = searchParams.get('s')
      if (searchQueryParam) {
        // sync store with URL
        setSearchPatternAction({
          searchPattern: searchQueryParam,
        })
      } else {
        // sync URL with store
        navigate(location.pathname, {
          s: selectedSearchPattern || null,
        })
      }

      setSynced(true)
    }
  }, [initialized])

  console.log('global sync is now gonna return ', synced)
  return synced
}

/**
 * Hook for syncing tag scene URL params with the Redux store
 */
export const useTagSceneSync = () => {
  const location = useLocation()
  const navigate = useNavigation()
  const { setTagFilterAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedTagFilter = useSelector(selectTagFilter)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (initialized) {
      console.log('running initialization sync in tag scene hook')
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
    console.log('tag scene sync is now going to return ', synced)
  }, [initialized])

  return synced
}
