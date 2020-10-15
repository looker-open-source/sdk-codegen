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
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import {
  Icon,
  Flex,
  FlexItem,
  Space,
  Text,
  IconButton,
} from '@looker/components'
import { SpecItems } from '../../ApiExplorer'
import { SpecState, SpecAction } from '../../reducers'
import { Search } from '../Search'
import { ApiSpecSelector } from './ApiSpecSelector'

interface HeaderProps {
  specs: SpecItems
  spec: SpecState
  specDispatch: Dispatch<SpecAction>
  toggleNavigation: () => void
  className?: string
}

export const HeaderLayout: FC<HeaderProps> = ({
  className,
  specs,
  spec,
  specDispatch,
  toggleNavigation,
}) => (
  <Space between className={className}>
    <Flex width="20rem" pr="large" alignItems="center">
      <IconButton
        size="small"
        onClick={toggleNavigation}
        icon="Hamburger"
        label="Toggle Navigation"
        mr="medium"
      />

      <NavLink to={`/${spec.key}`}>
        <Space gap="small">
          <Icon
            name="LookerLogo"
            alt="Looker"
            color="text5"
            style={{ width: '82px' }}
          />
          <Text color="key" fontSize="xlarge" fontWeight="medium">
            API Explorer
          </Text>
        </Space>
      </NavLink>
    </Flex>
    <FlexItem flex="1" px="large">
      <Search api={spec.api} specKey={spec.key} />
    </FlexItem>
    <FlexItem flexBasis="20rem" pl="large">
      <ApiSpecSelector specs={specs} spec={spec} specDispatch={specDispatch} />
    </FlexItem>
  </Space>
)

export const Header = styled(HeaderLayout)`
  height: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ui2};
  padding-left: ${({ theme }) => theme.space.small};
  padding-right: ${({ theme }) => theme.space.large};
`
