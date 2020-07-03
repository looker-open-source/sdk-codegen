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
import React, { FC } from 'react'
import { generatePressed, intentUIBlend } from '@looker/design-tokens'
import styled, { css } from 'styled-components'
import { IMethod } from '@looker/sdk-codegen'

interface DocStatusProps {
  method: IMethod
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'beta':
      return 'key'
    case 'stable':
      return 'positive'
    case 'experimental':
      return 'warn'
    case 'deprecated':
      return 'critical'
    default:
      return 'inform'
  }
}

type BadgeIntent =
  | 'warn'
  | 'positive'
  | 'critical'
  | 'inform'
  | 'neutral'
  | 'key'

const statusIntent = (intent: BadgeIntent) =>
  css`
    background: ${intentUIBlend(intent, 1)};
    color: ${({ theme }) => generatePressed(theme.colors[intent])};
  `

const StatusBadgeInternal = styled.div<DocStatusProps>`
  ${(props) => statusIntent(getStatusColor(props.method.status))};
  border-radius: 4px;
  font-size: ${({ theme }) => `${theme.fontSizes.small}`};
  font-weight: ${({ theme }) => `${theme.fontWeights.semiBold}`};
  padding: ${({
    theme: {
      space: { xxsmall, xsmall },
    },
  }) => `${xxsmall} ${xsmall}`};
`

export const DocStatus: FC<DocStatusProps> = ({ method }) => (
  <StatusBadgeInternal method={method} className={method.status}>
    {method.status.toLocaleUpperCase()}
  </StatusBadgeInternal>
)
