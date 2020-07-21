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

import {
  Icon,
  Text,
  Popover,
  PopoverContent,
  FieldCheckbox,
} from '@looker/components'
import { SearchCriterion } from '@looker/sdk-codegen'
import React, { useContext, FC, BaseSyntheticEvent } from 'react'

import { setCriteria } from '../../reducers'
import { SearchContext } from '../../context'

export const SearchCriteriaSelector: FC = () => {
  const { searchSettings, setSearchSettings } = useContext(SearchContext)

  const handlePick = (e: BaseSyntheticEvent) => {
    let criteria
    if (e.target.checked) {
      criteria = [...searchSettings.criteria, e.target.value]
    } else {
      criteria = searchSettings.criteria.filter((c) => c !== e.target.value)
    }
    setSearchSettings(setCriteria(criteria))
  }

  return (
    <Popover
      content={
        <PopoverContent>
          <Text>Search Criteria:</Text>
          {Object.keys(SearchCriterion)
            .filter((key) => !isNaN(Number(key)))
            .map((key) => (
              <FieldCheckbox
                checked={searchSettings.criteria.includes(SearchCriterion[key])}
                onChange={handlePick}
                key={key}
                value={SearchCriterion[key]}
                label={SearchCriterion[key]}
              />
            ))}
        </PopoverContent>
      }
    >
      <Icon name="Filter" size="small" />
    </Popover>
  )
}
