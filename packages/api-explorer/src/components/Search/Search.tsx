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
} from 'react'
import {
  Combobox,
  ComboboxInput,
  Space,
  MessageBar,
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

export const Search: FC<SearchProps> = ({ api, specKey }) => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [keywords, setKeywords] = useState(searchSettings.pattern)
  const [results, setResults] = useState<SearchResult>(undefined)
  const [selectedResult, setSelectedResult] = useState<ComboboxOptionObject>()
  const [error, setError] = useState('')
  const debouncedKeywords = useDebounce(keywords, 250)

  const handleSelect = (option?: ComboboxOptionObject) => {
    /** Search input cleared by clear search icon */
    if (!option) setKeywords('')
    setSelectedResult(option)
    // TODO: decide whether to highlight based on keywords or selected option
    setSearchSettings(setPattern(keywords))
  }

  const handleInputChange = (event: BaseSyntheticEvent) =>
    setKeywords(event.currentTarget.value)

  useEffect(() => {
    let results
    if (debouncedKeywords) {
      const searchCriteria = CriteriaToSet(searchSettings.criteria)
      results = api.search(keywords, searchCriteria)
      if (results.message.includes('Error')) setError(results.message)
    }
    setResults(results)
  }, [debouncedKeywords])

  /** Focus search input when '/' is pressed */
  const inputRef = React.useRef()
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
        <Combobox width="100%" onChange={handleSelect} value={selectedResult}>
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
      {error && (
        <MessageBar
          height="10px"
          intent="critical"
          canDismiss
          onDismiss={() => setError('')}
        >
          Something went wrong
        </MessageBar>
      )}
    </>
  )
}
