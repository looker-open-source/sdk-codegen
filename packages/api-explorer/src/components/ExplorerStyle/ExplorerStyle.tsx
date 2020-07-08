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
  AccordionDisclosure,
  Flex,
  Icon,
  IconButton,
  List,
  ListItem,
  Sidebar,
} from '@looker/components'
import { MethodBadge } from '../MethodBadge'
import { ApixHeading } from '../common'

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
    background: ${({ theme: { colors } }) => colors.background};
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

export const SideNavDisclosure = styled(AccordionDisclosure)<{ isOpen: boolean }>`
  padding-left: ${({ theme }) => theme.space.large};
  padding-right: ${({ theme }) => theme.space.large};

  color: ${(props) =>
    props.isOpen ? ({ theme }) => theme.colors.key : 'inherit'};

  ${Icon} {
    color: ${(props) =>
      props.isOpen ? ({ theme }) => theme.colors.key : 'inherit'};
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.key};
  }
`

export const SideNavContent = styled.div`
  padding: ${({
    theme: {
      space: { xxsmall, large },
    },
  }) => `${xxsmall} ${large}`};
`

export const SideNavList = styled(List)`
  border-left: dashed 1px ${({ theme }) => theme.colors.ui2};
  padding: ${({ theme }) => theme.space.xxsmall} 0
    ${({ theme }) => theme.space.xxsmall} ${({ theme }) => theme.space.xxsmall};
`

export const SideNavListItem = styled(ListItem)`
  margin-bottom: 0;

  a {
    border-radius: ${({ theme: { radii } }) => radii.medium};
    cursor: pointer;
    display: block;
    padding: ${({ theme }) => theme.space.xsmall};

    &:hover,
    &:focus,
    &.active {
      background-color: ${({ theme }) => theme.colors.ui1};

      ${MethodBadge} {
        border: solid 1px ${({ theme }) => theme.colors.ui2};
      }
    }

    &.active {
      ${ApixHeading} {
        font-weight: ${({ theme }) => theme.fontWeights.semiBold};
      }
    }
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
  }

  .codeMarker {
    background: yellow;
    position: absolute;
  }

  .hi {
    background: yellow;
  }

  .doc {
    grid-area: main;
  }
`

const reset = css`
  html {
    color: ${({ theme }) => theme.colors.text1};
    font-size: 100%;
    font-weight: ${({ theme }) => theme.fontWeights.normal};
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
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`

export const ExplorerStyle = createGlobalStyle`
  ${reset}
`
