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
  selectDiffOptions,
  useSettingActions,
  useSettingStoreState,
} from '../../../state'
import { useNavigation } from '../../../utils'
import { getDiffOptionsFromUrl } from '../../DiffScene/diffUtils'

/**
 * Hook for syncing diff scene URL params with the Redux store
 *
 * Diff scene specific search parameters: 'opts'
 */
export const useDiffStoreSync = () => {
  const location = useLocation()
  const { navigate } = useNavigation()
  const { setDiffOptionsAction } = useSettingActions()
  const { initialized } = useSettingStoreState()
  const selectedDiffOptions = useSelector(selectDiffOptions)

  useEffect(() => {
    if (initialized) {
      const params = new URLSearchParams(location.search)

      // syncing diff options on diff scene page
      const diffOptionsParam = getDiffOptionsFromUrl(params.get('opts'))
      if (diffOptionsParam) {
        setDiffOptionsAction({ diffOptions: diffOptionsParam })
      } else {
        // must confirm store tag filter param is valid for tag type before updating
        navigate(location.pathname, {
          opts: selectedDiffOptions ? selectedDiffOptions.join(',') : null,
        })
      }
    }
  }, [initialized])
}
