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
import { Flex, FlexItem, Heading, Space, Text, Box } from '@looker/components'
import styled from 'styled-components'

import { SpecItems } from '../../ApiExplorer'
import { SpecState, SpecAction } from '../../reducers'
import { Search } from '../Search'
import { Logo } from './svg'
import { ApiSpecSelector } from './ApiSpecSelector'

const StyledHeaderWrapper = styled(Flex)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ui2};
  flex-direction: row;
  height: 66px;
`

interface HeaderProps {
  specs: SpecItems
  spec: SpecState
  specDispatch: Dispatch<SpecAction>
}

export const Header: FC<HeaderProps> = ({ specs, spec, specDispatch }) => (
  <StyledHeaderWrapper
    alignItems="center"
    justifyContent="space-between"
    pt="medium"
    pr="large"
    pb="medium"
    pl="large"
  >
    <FlexItem align-items="center">
      <Heading fontSize="xxlarge">
        <NavLink to={`/${spec.key}`}>
          <Space gap="small">
            <Logo />
            <Text color="key" fontSize="xlarge">
              API Explorer
            </Text>
          </Space>
        </NavLink>
      </Heading>
    </FlexItem>
    <Box width="50%">
      <Search api={spec.api} specKey={spec.key} />
    </Box>
    <FlexItem>
      <ApiSpecSelector specs={specs} spec={spec} specDispatch={specDispatch} />
    </FlexItem>
  </StyledHeaderWrapper>
)
