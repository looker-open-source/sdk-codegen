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
import {
  generatePressed,
  intentUIBlend,
  IntentNames,
} from '@looker/design-tokens'
import { HttpMethod } from '@looker/sdk/src'
import styled, { css } from 'styled-components'

/**
 * Status of endpoint method.
 */
type MethodStatus = 'beta' | 'stable' | 'experimental' | 'deprecated' | 'inform'

interface MethodBadgeProps {
  httpMethod: HttpMethod | MethodStatus | string
  compact?: boolean
  alignTextCenter?: boolean
}

/**
 * Intent names to display the correct color for the badge based on the HTTP Method.
 */
type ApixIntentNames = IntentNames | 'key'

export const intentForStatus = (method: HttpMethod | MethodStatus | string) => {
  switch (method) {
    case 'DELETE':
    case 'deprecated':
      return 'critical'
    case 'HEAD':
      return 'neutral'
    case 'PATCH':
    case 'TRACE':
    case 'experimental':
      return 'warn'
    case 'POST':
    case 'stable':
      return 'positive'
    case 'PUT':
    case 'beta':
      return 'key'
    case 'GET':
    default:
      return 'inform'
  }
}

export const cssForIntent = (intent: ApixIntentNames) =>
  css`
    background: ${intentUIBlend(intent, 1)};
    color: ${({ theme }) => generatePressed(theme.colors[intent])};
  `

export const InternalMethodBadge = styled.div<{
  intent: ApixIntentNames
  compact?: boolean
  alignTextCenter?: boolean
}>`
  ${(props) => cssForIntent(props.intent)};
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: ${({ theme, compact }) =>
    `${compact ? `calc(${theme.fontSizes.large}/2)` : theme.fontSizes.xsmall}`};
  font-weight: ${({ theme }) => `${theme.fontWeights.semiBold}`};
  padding: ${({ theme, compact }) => `${theme.space.xxsmall}
    ${compact ? '0' : theme.space.xsmall}`};
  text-align: ${(props) => (props.alignTextCenter ? 'center' : 'left')};
  min-width: 2.5rem;
`

const MethodBadgeInternal: FC<MethodBadgeProps> = ({
  alignTextCenter,
  children,
  compact,
  httpMethod,
  ...props
}) => (
  <InternalMethodBadge
    alignTextCenter={alignTextCenter}
    compact={compact}
    intent={intentForStatus(httpMethod)}
    {...props}
  >
    {children}
  </InternalMethodBadge>
)

export const MethodBadge = styled(MethodBadgeInternal)<MethodBadgeProps>``
