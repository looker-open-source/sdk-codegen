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

import type {
  CompatibleHTMLProps,
  TypographyProps,
} from '@looker/design-tokens'
import {
  generatePressed,
  intentUIBlend,
  typography,
} from '@looker/design-tokens'
import type { HttpMethod } from '@looker/sdk-rtl'
import styled, { css } from 'styled-components'

/**
 * Status of endpoint method.
 */
type MethodStatus =
  | 'alpha'
  | 'beta'
  | 'stable'
  | 'experimental'
  | 'deprecated'
  | 'inform'
  | 'undocumented'

interface MethodBadgeProps
  extends CompatibleHTMLProps<HTMLDivElement>,
    TypographyProps {
  /** Determines background color */
  type: HttpMethod | MethodStatus | string
  compact?: boolean
  minWidth?: string
  titleStatus?: boolean
}

/**
 * Intent names to display the correct color for the badge based on the HTTP method or method status.
 */
type ApixIntentNames =
  | 'critical'
  | 'inform'
  | 'key'
  | 'neutral'
  | 'positive'
  | 'warn'

export const pickBadgeIntent = (type: HttpMethod | MethodStatus | string) => {
  switch (type) {
    case 'alpha':
    case 'DELETE':
    case 'deprecated':
      return 'critical'
    case 'HEAD':
      return 'neutral'
    case 'PATCH':
    case 'TRACE':
    case 'experimental':
    case 'undocumented':
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

export const MethodBadge = styled.div.attrs(
  ({
    fontSize = 'xsmall',
    fontWeight = 'semiBold',
    minWidth = '2.5rem',
  }: MethodBadgeProps) => ({
    fontSize,
    fontWeight,
    minWidth,
  })
)<MethodBadgeProps>`
  ${typography}

  ${({ type }) => cssForIntent(pickBadgeIntent(type))};

  background: ${({ type, titleStatus, theme: { colors } }) =>
    titleStatus ? colors.ui1 : intentUIBlend(pickBadgeIntent(type), 1)};
  border: 1px solid transparent;
  border-radius: ${({ theme: { radii } }) => radii.medium};

  /** NOTE: This is below minimum accessibility threshold font-size */
  ${({ compact }) => compact && `font-size: 9px;`}

  min-width: ${({ minWidth }) => minWidth};
  padding: ${({ compact, theme: { space } }) =>
    `${space.xxsmall} ${compact ? space.none : space.xsmall}`};
`
