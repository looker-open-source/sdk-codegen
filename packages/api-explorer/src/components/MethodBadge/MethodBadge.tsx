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
import { HttpMethod } from '@looker/sdk/src'
import styled, { css } from 'styled-components'

interface MethodBadgeProps {
  httpMethod: HttpMethod
  compact?: boolean
  alignTextCenter?: boolean
}

function getMethodColor(method: HttpMethod) {
  switch (method) {
    case 'DELETE':
      return 'critical'
    case 'GET':
      return 'inform'
    case 'HEAD':
      return 'neutral'
    case 'PATCH':
      return 'warn'
    case 'POST':
      return 'positive'
    case 'PUT':
      return 'key'
    case 'TRACE':
      return 'warn'
  }
}

type BadgeIntent =
  | 'warn'
  | 'positive'
  | 'critical'
  | 'inform'
  | 'neutral'
  | 'key'

const badgeIntent = (intent: BadgeIntent) =>
  css`
    background: ${intentUIBlend(intent, 1)};
    color: ${({ theme }) => generatePressed(theme.colors[intent])};
  `

const MethodBadgeInternal = styled.div<MethodBadgeProps>`
  ${(props) => badgeIntent(getMethodColor(props.httpMethod))};
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: ${({ theme, compact }) =>
    `${compact ? `calc(${theme.fontSizes.large}/2)` : theme.fontSizes.small}`};
  font-weight: ${({ theme }) => `${theme.fontWeights.semiBold}`};
  padding: ${({ theme, compact }) => `${theme.space.xxsmall}
    ${compact ? '0' : theme.space.xsmall}`};
  text-align: ${(props) => (props.alignTextCenter ? 'center' : 'left')};
  min-width: 2.5rem;
`

export const MethodBadge: FC<MethodBadgeProps> = ({
  alignTextCenter,
  httpMethod,
  compact,
  ...props
}) => (
  <MethodBadgeInternal
    alignTextCenter={alignTextCenter}
    compact={compact}
    httpMethod={httpMethod}
  >
    {props.children}
  </MethodBadgeInternal>
)
