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
  ComboboxList,
  ComboboxOption,
  Divider,
  Heading,
  Icon,
  Flex,
  Box,
  Space,
  MenuDisclosure,
  Menu,
  MenuItem,
  MenuList,
} from '@looker/components'
import { NavLink } from 'react-router-dom'
import {
  CriteriaToSet,
  IApiModel,
  IMethod,
  IntrinsicType,
  ISearchResult,
  TagList,
  TypeList,
} from '@looker/sdk-codegen'

import { SearchContext } from '../../context/search'
import { setPattern } from '../../reducers/search'
import { buildTypePath, buildMethodPath } from '../../utils'
import useDebounce from './hooks'
import { SearchCriteriaSelector } from './SearchCriteriaSelector'
import { FlexItem } from '@looker/components'
import { MessageBar } from '@looker/components'

type SearchResult = ISearchResult | undefined

interface SearchProps {
  api: IApiModel
  specKey: string
}

export const Search: FC<SearchProps> = ({ api, specKey }) => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)
  const [error, setError] = useState('')
  const [keywords, setKeywords] = useState(searchSettings.pattern)
  const [results, setResults] = useState<SearchResult>(undefined)

  const debouncedKeywords = useDebounce(keywords, 250)

  const handleChange = (event: BaseSyntheticEvent) => {
    setKeywords(event.currentTarget.value)
  }

  // TODO: setSearchSettings pattern when user clicks result item
  useEffect(() => {
    setSearchSettings(setPattern(keywords))
    if (debouncedKeywords) {
      const searchCriteria = CriteriaToSet(searchSettings.criteria)
      const results = api.search(keywords, searchCriteria)
      results.message.includes('Error')
        ? setError('Invalid search expression')
        : setResults(results)
    } else {
      setResults(undefined)
    }
  }, [debouncedKeywords])

  const inputRef = React.useRef()
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '/' && !inputRef.current.isFocused()) {
      event.preventDefault()
      inputRef.current && inputRef.current.focus()
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <Space>
        <Combobox value={{ value: keywords }} width="100%">
          <ComboboxInput
            autoFocus
            disabled={searchSettings.criteria.length === 0}
            onChange={handleChange}
            selectOnClick={true}
            autoComplete={false}
            isClearable={true}
            placeholder={
              searchSettings.criteria.length
                ? `Searching in ${searchSettings.criteria.join(', ')}`
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
          mr="large"
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

const allMethods = (tags: TagList): Array<IMethod> => {
  const result: Array<IMethod> = []
  Object.values(tags).forEach((methods) => {
    Object.values(methods).forEach((method) => {
      result.push(method)
    })
  })
  return result
}

const SearchResults: FC<ISearchResult & { specKey: string }> = ({
  tags,
  types,
  specKey,
}) => {
  const methods = allMethods(tags)
  const methodMatches = Object.entries(methods).length
  const typeMatches = Object.entries(types).length

  const typesRender = typeMatches > 0 && (
    <TypeResults specKey={specKey} types={types} />
  )

  const methodsRender = methodMatches > 0 && (
    <MethodResults specKey={specKey} tags={tags} />
  )
  return (
    <ComboboxList closeOnSelect={true}>
      {methodsRender}
      {methodMatches && typesRender && <Divider />}
      {typesRender}
    </ComboboxList>
  )
}

interface MethodResultsProps {
  specKey: string
  tags: TagList
}

// TODO: Add pin icon which when clicked opens a new tab
const MethodResults: FC<MethodResultsProps> = ({ specKey, tags }) => (
  <>
    {Object.entries(tags).map(([tag, methods]) =>
      Object.values(methods).map((method) => (
        <NavLink
          key={method.name}
          to={buildMethodPath(specKey, tag, method.name)}
        >
          <ComboboxOption
            key={method.name}
            value={buildMethodPath(specKey, tag, method.name)}
            indicator={false}
          >
            {method.summary}
            <Icon name="CaretLeft" />
            {tag}
            <Icon name="CaretLeft" />
            {'Methods'}
          </ComboboxOption>
        </NavLink>
      ))
    )}
  </>
)

interface TypeResultsProps {
  specKey: string
  types: TypeList
}

const TypeResults: FC<TypeResultsProps> = ({ specKey, types }) => (
  <>
    <Heading as="h4">Types</Heading>
    {Object.values(types)
      .filter((type) => !(type instanceof IntrinsicType))
      .map((type) => (
        <NavLink key={type.name} to={buildTypePath(specKey, type.name)}>
          <ComboboxOption value={type.name} indicator={false} />
        </NavLink>
      ))}
  </>
)
