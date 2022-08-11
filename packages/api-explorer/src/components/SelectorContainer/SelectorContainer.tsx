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

import type { FC } from 'react'
import React from 'react'
import type { SpaceHelperProps } from '@looker/components'
import { Space, IconButton } from '@looker/components'
import { ChangeHistory } from '@styled-icons/material/ChangeHistory'
import type { SpecItem } from '@looker/sdk-codegen'

import { Link } from '../Link'
import { diffPath, useNavigation } from '../../utils'
import { SdkLanguageSelector } from './SdkLanguageSelector'
import { ApiSpecSelector } from './ApiSpecSelector'

interface SelectorContainerProps extends SpaceHelperProps {
  /** Current selected spec */
  spec: SpecItem
}

export const HEADER_REM = 4

/**
 * Renders a container for selectors
 */
export const SelectorContainer: FC<SelectorContainerProps> = ({
  spec,
  ...spaceProps
}) => {
  const { buildPathWithGlobal } = useNavigation()
  // TODO: noticing that there are certain pages where we must delete extra params
  //       before pushing its link, what's a way we can handle this?
  return (
    <Space width="auto" {...spaceProps}>
      <SdkLanguageSelector />
      <ApiSpecSelector spec={spec} />
      <Link to={buildPathWithGlobal(`/${diffPath}/${spec.key}/`)}>
        <IconButton
          toggle
          label="Compare Specifications"
          icon={<ChangeHistory />}
          size="small"
        />
      </Link>
    </Space>
  )
}
