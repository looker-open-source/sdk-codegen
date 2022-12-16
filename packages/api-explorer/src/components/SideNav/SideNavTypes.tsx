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

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Accordion2, Heading } from '@looker/components'
import type { TypeList } from '@looker/sdk-codegen'
import { useRouteMatch } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from '../Link'
import { highlightHTML, useNavigation, buildTypePath } from '../../utils'
import { selectSearchPattern } from '../../state'

interface TypesProps {
  types: TypeList
  tag: string
  specKey: string
  className?: string
  defaultOpen?: boolean
}

export const SideNavTypes = styled(
  ({ className, types, tag, specKey, defaultOpen = false }: TypesProps) => {
    const { navigate, buildPathWithGlobalParams } = useNavigation()
    const searchPattern = useSelector(selectSearchPattern)
    const match = useRouteMatch<{ typeTag: string }>(
      `/:specKey/types/:typeTag/:typeName?`
    )
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const handleOpen = () => {
      const _isOpen = !isOpen
      setIsOpen(_isOpen)
      if (_isOpen) {
        navigate(`/${specKey}/types/${tag}`)
      } else {
        navigate(`/${specKey}/types`)
      }
    }

    useEffect(() => {
      const status = match
        ? defaultOpen || match.params.typeTag === tag
        : defaultOpen
      setIsOpen(status)
    }, [defaultOpen])

    /* TODO: Fix highlighting. It is applied but it is somehow being overridden */
    return (
      <Accordion2
        isOpen={isOpen}
        toggleOpen={handleOpen}
        className={className}
        label={
          <Heading as="h4" fontSize="small" py="xsmall">
            {highlightHTML(searchPattern, tag)}
          </Heading>
        }
      >
        <ul>
          {Object.values(types).map((type) => (
            <li key={type.name}>
              <Link
                to={buildPathWithGlobalParams(
                  buildTypePath(specKey, tag, type.name)
                )}
              >
                {highlightHTML(searchPattern, type.name)}
              </Link>
            </li>
          ))}
        </ul>
      </Accordion2>
    )
  }
)`
  font-family: ${({ theme }) => theme.fonts.brand};

  [aria-controls]:hover,
  [aria-expanded='true'] {
    h4,
    svg {
      color: ${({ theme }) => theme.colors.key};
    }
  }

  [aria-expanded='true'] h4 {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }

  ul {
    border-left: dashed 1px ${({ theme }) => theme.colors.ui2};
    list-style: none;
    margin: 0;
    padding: 0;
    padding-left: ${({ theme }) => theme.space.xxsmall};
    padding-top: ${({ theme }) => theme.space.xxsmall};
  }

  [aria-current] {
    background: ${({ theme }) => theme.colors.ui1};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }

  ${Link} {
    border-radius: ${({ theme }) => theme.radii.medium};
    display: block;
    overflow: hidden;
    padding: ${({ theme }) => theme.space.xsmall};
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover,
    &:focus,
    &.active {
      background: ${({ theme }) => theme.colors.ui1};
    }
  }
`
