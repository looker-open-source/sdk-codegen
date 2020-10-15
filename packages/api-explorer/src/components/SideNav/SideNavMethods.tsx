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

import React, { FC, useContext, useState } from 'react'
import styled from 'styled-components'
import {
  Accordion,
  AccordionDisclosure,
  AccordionContent,
  List,
  Heading,
} from '@looker/components'
import { MethodList } from '@looker/sdk-codegen'
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import { MethodBadge } from '@looker/run-it'

import { buildMethodPath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'

interface MethodsProps {
  className?: string
  methods: MethodList
  tag: string
  specKey: string
}

const SideNavMethodsLayout: FC<MethodsProps> = ({
  className,
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
  const [isOpen, setIsOpen] = useState(
    match ? match.params.methodTag === tag : false
  )
  const history = useHistory()

  const handleOpen = () => {
    const _isOpen = !isOpen
    setIsOpen(_isOpen)
    if (_isOpen) history.push(`/${specKey}/methods/${tag}`)
  }

  return (
    <Accordion isOpen={isOpen} toggleOpen={handleOpen} className={className}>
      <AccordionDisclosure>{highlightHTML(pattern, tag)}</AccordionDisclosure>
      <AccordionContent>
        <List>
          {Object.values(methods).map((method) => (
            <NavLink
              key={method.name}
              to={buildMethodPath(specKey, tag, method.name)}
            >
              <li>
                <MethodBadge
                  textAlign="center"
                  compact
                  type={method.httpMethod}
                >
                  {method.httpMethod.toUpperCase()}
                </MethodBadge>
                <Heading as="h5" truncate>
                  {highlightHTML(pattern, method.summary)}
                </Heading>
              </li>
            </NavLink>
          ))}
        </List>
      </AccordionContent>
    </Accordion>
  )
}

export const SideNavMethods = styled(SideNavMethodsLayout)`
  ${AccordionDisclosure} {
    padding-left: ${({ theme }) => theme.space.large};
    padding-right: ${({ theme }) => theme.space.large};

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.key};
    }

    &[aria-expanded='true'] {
      color: ${({ theme }) => theme.colors.key};
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

    ${MethodBadge} {
      margin-right: ${({ theme }) => theme.space.small};
    }

    &:hover,
    &:focus,
    &.active {
      background-color: ${({ theme }) => theme.colors.ui1};

      ${MethodBadge} {
        border: solid 1px ${({ theme }) => theme.colors.ui2};
      }
    }
  }

  [aria-current] ${Heading} {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
`
