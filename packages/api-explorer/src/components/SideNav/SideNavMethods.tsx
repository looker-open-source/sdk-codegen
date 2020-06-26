/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { FC, useContext } from 'react'
import { SidebarItem, Text } from '@looker/components'
import { MethodList } from '@looker/sdk-codegen'
import { NavLink } from 'react-router-dom'

import { buildMethodPath, highlightHTML } from '../../utils'
import { SearchContext } from '../../context'
import { MethodBadge } from './MethodBadge'
import { Heading } from '@looker/components'

interface MethodsProps {
  methods: MethodList
  tag: string
  specKey: string
}

export const SideNavMethods: FC<MethodsProps> = ({ methods, tag, specKey }) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)

  // TODO: make selected item visible
  return (
    <ul>
      {Object.values(methods).map((method) => (
        <li key={method.name}>
          <NavLink to={buildMethodPath(specKey, tag, method.name)}>
            <SidebarItem key={method.name} as="span">
              <>
                <MethodBadge verb={method.httpMethod} />
                <Heading as="h5" truncate>
                  {highlightHTML(pattern, method.summary)}
                </Heading>
              </>
            </SidebarItem>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
