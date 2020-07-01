/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import React, {
  BaseSyntheticEvent,
  FC,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import {
  Combobox,
  ComboboxInput,
  Space,
  ComboboxOptionObject,
} from '@looker/components'
import { CriteriaToSet, IApiModel, ISearchResult } from '@looker/sdk-codegen'

import { SearchContext } from '../../context'
import { setPattern } from '../../reducers'
import { useDebounce } from './hooks'
import { SearchCriteriaSelector } from './SearchCriteriaSelector'
import { SearchResults } from './SearchResults'

type SearchResult = ISearchResult | undefined

interface SearchProps {
  api: IApiModel
  specKey: string
}
/* eslint-disable  @typescript-eslint/ban-ts-ignore  */
export const Search: FC<SearchProps> = ({ api, specKey }) => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [pattern, setSearchPattern] = useState(searchSettings.pattern)
  const [results, setResults] = useState<SearchResult>(undefined)
  const [selectedResult, setSelectedResult] = useState<ComboboxOptionObject>()
  const debouncedPattern = useDebounce(pattern, 250)

  const handleInputChange = (event: BaseSyntheticEvent) => {
    setSearchPattern(event.currentTarget.value)
  }

  const handleSelectOrClear = (option?: ComboboxOptionObject) => {
    /** Determine if trigger is select or clear action */
    const value = option ? pattern : ''
    setSearchSettings(setPattern(value))
    setSelectedResult({ value })
  }

  useEffect(() => {
    let results
    if (debouncedPattern) {
      const searchCriteria = CriteriaToSet(searchSettings.criteria)
      results = api.search(pattern, searchCriteria)
    }
    setResults(results)
  }, [debouncedPattern])

  /** Focus search input when '/' is pressed */
  const inputRef = useRef<HTMLInputElement>(null)
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '/' && document.activeElement !== inputRef.current) {
      inputRef.current && inputRef.current.focus()
      event.preventDefault()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <Space>
        <Combobox
          width="100%"
          onChange={handleSelectOrClear}
          value={selectedResult}
        >
          <ComboboxInput
            autoFocus
            autoComplete={false}
            disabled={!searchSettings.criteria.length}
            isClearable
            onChange={handleInputChange}
            placeholder={
              searchSettings.criteria.length
                ? `Searching in ${searchSettings.criteria.join(', ')}.`
                : `No search criteria selected.`
            }
            ref={inputRef}
          />
          {results && <SearchResults {...results} specKey={specKey} />}
        </Combobox>
        <SearchCriteriaSelector />
      </Space>
    </>
  )
}
