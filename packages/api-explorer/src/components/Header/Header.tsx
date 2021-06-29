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
import {
  Icon,
  Space,
  IconButton,
  Heading,
  Header as SemanticHeader,
} from '@looker/components'
import { LookerLogo } from '@looker/icons'
import { ChangeHistory } from '@styled-icons/material/ChangeHistory'
import { Menu } from '@styled-icons/material/Menu'
import { SpecList } from '@looker/sdk-codegen'

import { Link } from '../Link'
import { SpecState, SpecAction } from '../../reducers'
import { diffPath } from '../../utils'
import { SdkLanguageSelector } from './SdkLanguageSelector'
import { ApiSpecSelector } from './ApiSpecSelector'

interface HeaderProps {
  /** Specs to choose from */
  specs: SpecList
  /** Current selected spec */
  spec: SpecState
  /** Spec state setter */
  specDispatch: Dispatch<SpecAction>
  /** Nav state setter */
  toggleNavigation: (target?: boolean) => void
  className?: string
}

export const HEADER_REM = 4

/**
 * Renders the API Explorer header
 */
export const HeaderLayout: FC<HeaderProps> = ({
  className,
  specs,
  spec,
  specDispatch,
  toggleNavigation,
}) => (
  <SemanticHeader
    height={`${HEADER_REM}rem`}
    className={className}
    pl="small"
    pr="large"
  >
    <Space>
      <IconButton
        size="small"
        onClick={() => toggleNavigation()}
        icon={<Menu />}
        label="Toggle Navigation"
      />

      <Link to={`/${spec.key}`}>
        <Space gap="small">
          <Icon
            icon={<LookerLogo />}
            alt="Looker"
            color="text5"
            style={{ width: '82px' }}
          />
          <Heading color="key">API Explorer</Heading>
        </Space>
      </Link>
    </Space>
    <Space width="auto">
      <SdkLanguageSelector />
      <ApiSpecSelector specs={specs} spec={spec} specDispatch={specDispatch} />
      <Link to={`/${diffPath}/${spec.key}/`}>
        <IconButton
          toggle
          label="Compare Specifications"
          icon={<ChangeHistory />}
          size="small"
        />
      </Link>
    </Space>
  </SemanticHeader>
)

export const Header = styled(HeaderLayout)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ui2};
`
