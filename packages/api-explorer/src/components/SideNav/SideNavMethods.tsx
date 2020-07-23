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
import { Accordion, AccordionContent, Space } from '@looker/components'
import { MethodList } from '@looker/sdk-codegen'
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import { MethodBadge } from '@looker/run-it'

import { buildMethodPath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'
import { ApixHeading } from '../common'
import {
  SideNavDisclosure,
  SideNavContent,
  SideNavList,
  SideNavListItem,
} from '../ExplorerStyle'

interface MethodsProps {
  methods: MethodList
  tag: string
  specKey: string
}

export const SideNavMethods: FC<MethodsProps> = ({ methods, tag, specKey }) => {
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
    <Accordion isOpen={isOpen} toggleOpen={handleOpen}>
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
                      textAlign="center"
                      compact
                      type={method.httpMethod}
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
