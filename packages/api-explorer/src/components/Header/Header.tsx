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

import React, { FC, Dispatch } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import {
  Icon,
  Space,
  IconButton,
  Heading,
  Header as SemanticHeader,
} from '@looker/components'

import { SpecList } from '@looker/sdk-codegen'
import { SpecState, SpecAction } from '../../reducers'
import { diffPath } from '../../utils'
import { ApiSpecSelector } from './ApiSpecSelector'

interface HeaderProps {
  specs: SpecList
  spec: SpecState
  specDispatch: Dispatch<SpecAction>
  toggleNavigation: (target?: boolean) => void
  className?: string
}

export const HeaderLayout: FC<HeaderProps> = ({
  className,
  specs,
  spec,
  specDispatch,
  toggleNavigation,
}) => (
  <SemanticHeader height="4rem" className={className} pl="small" pr="large">
    <Space>
      <IconButton
        size="small"
        onClick={() => toggleNavigation()}
        icon="Hamburger"
        label="Toggle Navigation"
      />

      <NavLink to={`/${spec.key}`}>
        <Space gap="small">
          <Icon
            name="LookerLogo"
            alt="Looker"
            color="text5"
            style={{ width: '82px' }}
          />
          <Heading color="key">API Explorer</Heading>
        </Space>
      </NavLink>
    </Space>
    <Space width="auto">
      <ApiSpecSelector specs={specs} spec={spec} specDispatch={specDispatch} />
      <NavLink to={`/${diffPath}/${spec.key}/`}>
        <IconButton
          toggle
          label="Compare Specifications"
          icon="ChangeHistory"
          size="small"
        />
      </NavLink>
    </Space>
  </SemanticHeader>
)

export const Header = styled(HeaderLayout)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ui2};
`
