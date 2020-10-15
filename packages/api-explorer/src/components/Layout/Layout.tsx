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

import {
  CompatibleHTMLProps,
  reset,
  ColorProps,
  color,
  layout,
  LayoutProps,
} from '@looker/design-tokens'
import { PaddingProps, padding } from 'styled-system'
import styled, { css } from 'styled-components'

/**
 *
 * NOTE: These are pre-release components from @looker/components
 *
 * These should not be modified in place to preserve consistency with
 * soon-to-be-published @looker/components versions.
 *
 * @TODO - Replace with imports from @looker/components
 *
 */

export const Layout = styled.div<{ hasAside?: boolean }>`
  display: flex;
  flex-direction: ${({ hasAside }) => (hasAside ? 'row' : 'column')};
  width: 100%;
`

export const Page = styled(Layout)`
  width: 100vw;
  height: 100vh;
`

export interface SemanticLayoutBase
  extends LayoutProps,
    PaddingProps,
    ColorProps,
    CompatibleHTMLProps<HTMLElement> {}

const semanticLayoutCSS = css`
  ${reset}
  ${layout}
  ${padding}
  ${color}
`

export const Header = styled.header<SemanticLayoutBase>`
  ${semanticLayoutCSS}
  flex: 0 0 auto;
`

export const Section = styled.div<SemanticLayoutBase>`
  ${semanticLayoutCSS}
  flex: 1 0 auto;
  height: 100%;
  width: 0;
`

Section.defaultProps = {
  p: 'xxlarge',
}

interface AsideProps extends SemanticLayoutBase {
  /**
   * Width
   * @default '16rem'
   */
  width?: string
}

export const Aside = styled.aside<AsideProps>`
  ${semanticLayoutCSS}
  flex: 0 0 ${({ width }) => width};
  max-width: ${({ width }) => width};
  min-width: ${({ width }) => width};
  width: 0;
`

Aside.defaultProps = { width: '16rem' }
