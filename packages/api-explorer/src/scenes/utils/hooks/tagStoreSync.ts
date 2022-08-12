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
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import {
  selectTagFilter,
  useSettingActions,
  useSettingStoreState,
} from '../../../state'
import { isValidFilter, useNavigation } from '../../../utils'

/**
 * Hook for syncing tag scene URL params with the Redux store
 *
 * Tag scene specific search parameters: 'v'
 */
export const useTagStoreSync = () => {
  const location = useLocation()
  const { navigate } = useNavigation()
  const { setTagFilterAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedTagFilter = useSelector(selectTagFilter)

  useEffect(() => {
    if (initialized) {
      const params = new URLSearchParams(location.search)

      // syncing verb filter on tag scene page
      const verbParam = params.get('v') || 'ALL'
      const validVerbParam = isValidFilter(location, verbParam)
      if (validVerbParam) {
        setTagFilterAction({ tagFilter: verbParam.toUpperCase() })
      } else {
        const verb = isValidFilter(location, selectedTagFilter)
          ? selectedTagFilter
          : 'ALL'
        navigate(location.pathname, {
          v: verb === 'ALL' ? null : verb.toLowerCase(),
        })
      }
    }
  }, [initialized])
}
