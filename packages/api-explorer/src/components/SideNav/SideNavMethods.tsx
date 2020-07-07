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
import {
  Accordion,
  AccordionContent,
  AccordionDisclosure,
  Icon,
  Space,
  ListItem,
  List,
} from '@looker/components'

import styled from 'styled-components'
import { MethodList } from '@looker/sdk-codegen'
import { NavLink, useRouteMatch } from 'react-router-dom'
import { buildMethodPath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'
import { MethodBadge } from '../MethodBadge'
import { ApixHeading } from '../common'

interface MethodsProps {
  methods: MethodList
  tag: string
  specKey: string
}

const SideNavDisclosure = styled(AccordionDisclosure)<{ isOpen: boolean }>`
  padding-left: ${({ theme }) => theme.space.large};
  padding-right: ${({ theme }) => theme.space.large};

  color: ${(props) =>
    props.isOpen ? ({ theme }) => theme.colors.key : 'inherit'};

  ${Icon} {
    color: ${(props) =>
      props.isOpen ? ({ theme }) => theme.colors.key : 'inherit'};
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.key};
  }
`

const SideNavContent = styled.div`
  padding: ${({
    theme: {
      space: { xxsmall, large },
    },
  }) => `${xxsmall} ${large}`};
`

const SideNavList = styled(List)`
  border-left: dashed 1px ${({ theme }) => theme.colors.ui2};
  padding: ${({ theme }) => theme.space.xxsmall} 0
    ${({ theme }) => theme.space.xxsmall} ${({ theme }) => theme.space.xxsmall};
`

const SideNavListItem = styled(ListItem)`
  margin-bottom: 0;

  a {
    border-radius: ${({ theme: { radii } }) => radii.medium};
    cursor: pointer;
    display: block;
    padding: ${({ theme }) => theme.space.xsmall};

    &:hover,
    &:focus,
    &.active {
      background-color: ${({ theme }) => theme.colors.ui1};

      ${MethodBadge} {
        border: solid 1px ${({ theme }) => theme.colors.ui2};
      }
    }

    &.active {
      ${ApixHeading} {
        font-weight: ${({ theme }) => theme.fontWeights.semiBold};
      }
    }
  }
`

export const SideNavMethods: FC<MethodsProps> = ({ methods, tag, specKey }) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)
  const match = useRouteMatch<{ methodTag: string }>(
    `/:specKey/methods/:methodTag/:methodName?`
  )
  const [isOpen, setIsOpen] = useState<boolean>(
    match ? match.params.methodTag === tag : false
  )

  return (
    <Accordion isOpen={isOpen} toggleOpen={setIsOpen}>
      <SideNavDisclosure isOpen={isOpen}>
        {highlightHTML(pattern, tag)}
      </SideNavDisclosure>
      <AccordionContent>
        <SideNavContent>
          <SideNavList>
            {Object.values(methods).map((method) => (
              <SideNavListItem key={method.name}>
                <NavLink to={buildMethodPath(specKey, tag, method.name)}>
                  <Space gap="xsmall">
                    <MethodBadge
                      alignTextCenter
                      compact
                      httpMethod={method.httpMethod}
                    >
                      {method.httpMethod.toUpperCase()}
                    </MethodBadge>
                    <ApixHeading
                      as="h5"
                      mb="0"
                      pt="0"
                      fontWeight="normal"
                      truncate
                    >
                      {highlightHTML(pattern, method.summary)}
                    </ApixHeading>
                  </Space>
                </NavLink>
              </SideNavListItem>
            ))}
          </SideNavList>
        </SideNavContent>
      </AccordionContent>
    </Accordion>
  )
}
