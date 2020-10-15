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

import React, { FC, Dispatch } from 'react'
import { NavLink } from 'react-router-dom'
import { FlexItem, Space, Text } from '@looker/components'

import { SpecItems } from '../../ApiExplorer'
import { SpecState, SpecAction } from '../../reducers'
import { Search } from '../Search'
import { HeaderWrapper } from '../ExplorerStyle'
import { ApixHeading } from '../common'
import { Logo } from './svg'
import { ApiSpecSelector } from './ApiSpecSelector'

interface HeaderProps {
  specs: SpecItems
  spec: SpecState
  specDispatch: Dispatch<SpecAction>
}

export const Header: FC<HeaderProps> = ({ specs, spec, specDispatch }) => (
  <HeaderWrapper>
    <FlexItem align-items="center">
      <ApixHeading fontSize="xxlarge">
        <NavLink to={`/${spec.key}`}>
          <Space gap="small">
            <Logo />
            <Text color="key" fontSize="xlarge" fontWeight="medium">
              API Explorer
            </Text>
          </Space>
        </NavLink>
      </ApixHeading>
    </FlexItem>
    <FlexItem width="50%">
      <Search api={spec.api} specKey={spec.key} />
    </FlexItem>
    <FlexItem>
      <ApiSpecSelector specs={specs} spec={spec} specDispatch={specDispatch} />
    </FlexItem>
  </HeaderWrapper>
)
