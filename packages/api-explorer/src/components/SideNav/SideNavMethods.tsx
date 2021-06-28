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

import React, { FC, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Accordion,
  AccordionDisclosure,
  AccordionContent,
  List,
  Heading,
} from '@looker/components'
import { MethodList } from '@looker/sdk-codegen'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Link } from '../Link'
import { buildMethodPath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'

interface MethodsProps {
  className?: string
  defaultOpen?: boolean
  methods: MethodList
  tag: string
  specKey: string
}

const SideNavMethodsLayout: FC<MethodsProps> = ({
  className,
  defaultOpen = false,
  methods,
  tag,
  specKey,
}) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)
  const match = useRouteMatch<{ methodTag: string }>(
    `/:specKey/methods/:methodTag/:methodName?`
  )
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const history = useHistory()

  const handleOpen = () => {
    const _isOpen = !isOpen
    setIsOpen(_isOpen)
    if (_isOpen) history.push(`/${specKey}/methods/${tag}`)
  }

  useEffect(() => {
    const status = match
      ? defaultOpen || match.params.methodTag === tag
      : defaultOpen
    setIsOpen(status)
  }, [defaultOpen])

  return (
    <Accordion
      defaultOpen={defaultOpen}
      isOpen={isOpen}
      toggleOpen={handleOpen}
      className={className}
    >
      <AccordionDisclosure>
        {/* TODO: Fix highlighting. It is applied but it is somehow being overridden */}
        <Heading as="h5">{highlightHTML(pattern, tag)}</Heading>
      </AccordionDisclosure>
      <AccordionContent>
        <AutoHeightList>
          {Object.values(methods).map((method) => (
            <SideNavLink
              key={method.name}
              to={`${buildMethodPath(specKey, tag, method.name)}`}
            >
              <li>
                <Heading as="h5" truncate>
                  {highlightHTML(pattern, method.summary)}
                </Heading>
              </li>
            </SideNavLink>
          ))}
        </AutoHeightList>
      </AccordionContent>
    </Accordion>
  )
}

const AutoHeightList = styled(List)`
  height: auto;
`

const SideNavLink = styled(Link)`
  &:hover,
  &:focus,
  &.active {
    li {
      background-color: ${({ theme }) => theme.colors.ui1};
    }
  }

  li {
    display: flex;
    border-radius: ${({ theme: { radii } }) => radii.medium};
    padding: ${({ theme }) => theme.space.xsmall};
  }
`

export const SideNavMethods = styled(SideNavMethodsLayout)`
  ${AccordionDisclosure} {
    padding-left: ${({ theme }) => theme.space.large};
    padding-right: ${({ theme }) => theme.space.large};

    &:hover {
      color: ${({ theme }) => theme.colors.key};
      ${Heading} {
        color: ${({ theme }) => theme.colors.key};
      }
    }

    &[aria-expanded='true'] {
      color: ${({ theme }) => theme.colors.key};
      ${Heading} {
        color: ${({ theme }) => theme.colors.key};
        font-weight: ${({ theme }) => theme.fontWeights.semiBold};
      }
    }
  }

  ${AccordionContent} {
    padding: ${({
      theme: {
        space: { xxsmall, large },
      },
    }) => `${xxsmall} ${large}`};
  }

  ${List} {
    border-left: dashed 1px ${({ theme }) => theme.colors.ui2};
    padding: ${({ theme }) => theme.space.xxsmall};
    padding-right: 0;
  }

  li {
    display: flex;
    border-radius: ${({ theme: { radii } }) => radii.medium};
    padding: ${({ theme }) => theme.space.xsmall};

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.ui1};
    }
  }

  [aria-current] {
    background-color: ${({ theme }) => theme.colors.ui1};

    ${Heading} {
      font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    }
  }
`
