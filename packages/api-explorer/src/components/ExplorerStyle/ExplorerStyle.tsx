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

import styled, { css, createGlobalStyle } from 'styled-components'
import {
  Flex,
  IconButton,
  Sidebar,
  SidebarGroup,
  SidebarItem,
} from '@looker/components'

export const HEADER_HEIGHT = '66px'

export const HeaderWrapper = styled(Flex).attrs({
  alignItems: 'center',
  justifyContent: 'space-between',
  height: HEADER_HEIGHT,
  flexDirection: 'row',
  pt: 'medium',
  pr: 'large',
  pb: 'medium',
  pl: 'large',
})`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ui2};
`

interface SideNavWrapperProps {
  headerHeight?: string
}

export const SideNavToggleWrapper = styled.div<SideNavWrapperProps>`
  position: relative;
  margin-top: ${parseInt(HEADER_HEIGHT, 10) / 2};

  ${IconButton} {
    background: ${({ theme: { colors }}) => colors.background };
    transform: translateX(-50%) translateY(-50%);
    position: fixed;
  }
`

interface SideNavStyleProps {
  open: boolean
}

export const SideNavDivider = styled.div<SideNavStyleProps>`
  transition: border 0.3s;
  border-left: 1px solid
    ${({ theme, open }) => (open ? theme.colors.ui2 : 'transparent')};
  grid-area: divider;
  overflow: visible;
  position: relative;
  &:hover {
    border-color: ${({ theme, open }) =>
      open ? theme.colors.ui3 : 'transparent'};
  }
`

export const PageLayout = styled.div<SideNavStyleProps>`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: ${({ open }) =>
    open ? '20rem 0 50rem' : '1.5rem 0 50rem'};
  grid-template-areas: 'sidebar divider main';
  position: relative;

  ${Sidebar} {
    grid-area: sidebar;
    width: 20rem;
    z-index: 0;
    padding: 0 ${({ theme }) => theme.space.medium};

    button {
      color: ${({ theme }) => theme.colors.text1};
      cursor: pointer;
      min-height: 2.25rem;

      &:hover,
      &:focus,
      &[aria-expanded='true'] {
        color: ${({ theme }) => theme.colors.key};
      }
    }
  }

  .codeMarker {
    background: yellow;
    position: absolute;
  }

  .hi {
    background: yellow;
  }

  .main {
    padding: ${({ theme }) => theme.space.xxlarge};
  }

  ${SidebarGroup} {
    > div {
      border-left: 1px dashed ${({ theme }) => theme.colors.ui2};
      padding: ${({
        theme: {
          space: { xxsmall, xsmall },
        },
      }) => `${xxsmall} 0 ${xxsmall} ${xsmall}`};
    }

    .active > span {
      background-color: ${({ theme }) => theme.colors.ui1};
      font-weight: ${({ theme }) => theme.fontWeights.semiBold};

      div > div {
        border: 1px solid ${({ theme }) => theme.colors.ui2};
      }
    }
  }

  ${SidebarItem} {
    font-size: ${({ theme }) => theme.fontSizes.small};

    & {
      border-radius: ${({ theme: { radii }}) => radii.medum};;
      display: flex;
      align-items: center;
      padding: ${({ theme }) => theme.space.xsmall};
    }

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.ui1};
    }
  }

  .doc {
    grid-area: main;
  }
`

const reset = css`
  html {
    color: #4c535b;
    font-size: 100%;
    font-weight: 400;
  }

  html,
  body {
    height: 100%;
  }

  html,
  div,
  object,
  iframe,
  blockquote,
  li,
  form,
  legend,
  label,
  table,
  header,
  footer,
  nav,
  section,
  figure {
    margin: 0;
    padding: 0;
  }

  header,
  footer,
  nav,
  section,
  article,
  hgroup,
  figure {
    display: block;
  }

  em,
  i {
    font-style: italic;
  }

  b,
  strong {
    font-weight: 700;
  }
`

const typography = css`
  .mainColumn {
    --default-bottom-margin: 1.375rem;
  }

  .mainColumn h1,
  .mainColumn h2,
  .mainColumn h3,
  .mainColumn h4,
  .mainColumn h5,
  .mainColumn h6 {
    color: ${(props) => props.theme.colors.palette.charcoal700};
    font-weight: 600;
    margin-bottom: 0.35rem;
  }

  .mainColumn h1 {
    line-height: 1.1944444444;
    margin-bottom: ${(props) => props.theme.space.large};
  }

  /* Max-width here keeps line lengths in check */
  .mainColumn p,
  .mainColumn ul,
  .mainColumn ol {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: var(--default-bottom-margin);
    max-width: 580px;
  }

  .mainColumn li ul,
  .mainColumn li ol {
    margin-bottom: 0;
  }

  .mainColumn pre {
    background-color: ${(props) => props.theme.colors.palette.charcoal700};
    border-radius: 8px;
    color: #fff;
    font-size: 0.875rem;
    margin-bottom: var(--default-bottom-margin);
    overflow: auto;
    padding: ${(props) => props.theme.space.large};
    width: 100%;
    max-width: 580px;
  }

  .mainColumn code {
    font-family: 'Roboto Mono', monospace !important;
    line-height: 1.5;
  }

  .mainColumn p code {
    background-color: ${(props) => props.theme.colors.palette.charcoal100};
    border-radius: 4px;
    color: ${(props) => props.theme.colors.palette.charcoal700};
    padding: 0 0.125rem;
  }
`

const links = css`
  .mainColumn a {
    color: ${(props) => props.theme.colors.palette.blue500};
    text-decoration: underline;
  }
`

const tables = css`
  .mainColumn table {
    border: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    border-collapse: collapse;
    margin-bottom: var(--default-bottom-margin);
    overflow: auto;
    width: 100%;
  }

  .mainColumn th {
    background-color: ${(props) => props.theme.colors.palette.charcoal100};
    border-right: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    font-weight: 600;
    padding: 0.5rem;
  }

  .mainColumn td {
    border-top: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    border-right: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    text-align: left;
    vertical-align: top;
    padding: 0.5rem;
  }
`

export const ExplorerStyle = createGlobalStyle`
  ${reset}
  ${links}
  ${typography}
  ${tables}
`
