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
  ComboboxOptionObject,
} from '@looker/components'
import { CriteriaToSet, IApiModel, ISearchResult } from '@looker/sdk-codegen'

import { SearchContext } from '../../context'
import { setPattern } from '../../reducers'
import { useDebounce } from './hooks'
import { SearchResults } from './SearchResults'
import { SearchError } from './SearchError'

type SearchResult = ISearchResult | undefined

interface SearchProps {
  api: IApiModel
  specKey: string
}

export const Search: FC<SearchProps> = ({ api, specKey }) => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [pattern, setSearchPattern] = useState(searchSettings.pattern)
  const debouncedPattern = useDebounce(pattern, 250)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult>(undefined)
  const searchCriteria = CriteriaToSet(searchSettings.criteria)

  const handleInputChange = (event: BaseSyntheticEvent) => {
    setSearchPattern(event.currentTarget.value)
  }

  const handleSelectOrClear = (option?: ComboboxOptionObject) => {
    /** Determine if trigger is select or clear action */
    const value = option ? pattern : ''
    setSearchSettings(setPattern(value))
    if (!value) {
      setSearchResults(undefined)
      setSearchPattern(value)
      setError('')
    }
  }

  useEffect(() => {
    let results
    if (debouncedPattern) {
      results = api.search(pattern, searchCriteria)
    }
    results && results.message.includes('Error')
      ? setError(results.message)
      : setError('')
    setSearchResults(results)
  }, [debouncedPattern])

  // TODO make this hook pass through on HTMLInputElements
  /** Focus search input when '/' is pressed if not in an input element */
  const inputRef = useRef<HTMLInputElement>(null)
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '/' && document.activeElement !== inputRef.current) {
      if (document.activeElement instanceof HTMLInputElement) return
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
    <Combobox
      onChange={handleSelectOrClear}
      value={{ value: pattern }}
      width="100%"
    >
      <ComboboxInput
        autoFocus
        autoComplete={false}
        disabled={!searchSettings.criteria.length}
        isClearable
        onChange={handleInputChange}
        placeholder="Press '/' to start searching."
        ref={inputRef}
      />
      {error && <SearchError error={error} />}
      {!error && searchResults && (
        <SearchResults {...searchResults} specKey={specKey} />
      )}
    </Combobox>
  )
}
