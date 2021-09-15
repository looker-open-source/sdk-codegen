/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import React, { FC, useContext } from 'react'
import { Heading } from '@looker/components'
import { TypeList, IntrinsicType } from '@looker/sdk-codegen'
import styled from 'styled-components'
import { Link } from '../Link'
import { buildTypePath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'

interface TypeProps {
  specKey: string
  types: TypeList
}

export const SideNavTypes: FC<TypeProps> = ({ types, specKey }) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)

  return (
    <>
      {Object.values(types)
        .filter((type) => !(type instanceof IntrinsicType))
        .map((type) => (
          <SideNavLink
            key={type.name}
            to={`${buildTypePath(specKey, type.name)}`}
          >
            <Heading as="h5" truncate>
              {highlightHTML(pattern, type.name)}
            </Heading>
          </SideNavLink>
        ))}
    </>
  )
}

const SideNavLink = styled(Link)`
  display: block;
  padding: ${({
    theme: {
      space: { xsmall, large },
    },
  }) => `${xsmall} ${large}`};

  &:hover,
  &:focus {
    ${Heading} {
      color: ${({ theme }) => theme.colors.key};
    }
  }

  &.active {
    ${Heading} {
      color: ${({ theme }) => theme.colors.key};
      font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    }
  }
`
