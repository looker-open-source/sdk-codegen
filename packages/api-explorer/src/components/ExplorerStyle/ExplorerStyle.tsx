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

import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import {
  AccordionDisclosure,
  Card,
  Flex,
  Icon,
  IconButton,
  List,
  ListItem,
  Sidebar,
} from '@looker/components'
import { MethodBadge, RunIt } from '@looker/run-it'
import { ApixHeading } from '../common'

/**
 * Defines all Api Explorer styles
 */

export const HEADER_HEIGHT = '66px'

export const HeaderWrapper = styled(Flex).attrs({
  alignItems: 'center',
  flexDirection: 'row',
  height: HEADER_HEIGHT,
  justifyContent: 'space-between',
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
  margin-top: ${parseInt(HEADER_HEIGHT, 10) / 2};
  position: relative;

  ${IconButton} {
    background: ${({ theme: { colors } }) => colors.background};
    position: fixed;
    transform: translateX(-50%) translateY(-50%);
  }
`

interface SideNavStyleProps {
  open: boolean
}

export const SideNavDivider = styled.div<SideNavStyleProps>`
  border-left: 1px solid
    ${({ theme, open }) => (open ? theme.colors.ui2 : 'transparent')};
  grid-area: divider;
  overflow: visible;
  position: relative;
  transition: border 0.3s;

  &:hover {
    border-color: ${({ theme, open }) =>
      open ? theme.colors.ui3 : 'transparent'};
  }
`

export const SideNavDisclosure = styled(AccordionDisclosure)<{
  isOpen: boolean
}>`
  color: ${(props) =>
    props.isOpen ? ({ theme }) => theme.colors.key : 'inherit'};
  padding-left: ${({ theme }) => theme.space.large};
  padding-right: ${({ theme }) => theme.space.large};

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

export const SideNavTypesLink = styled(NavLink)`
  cursor: pointer;
  display: block;
  padding: ${({
    theme: {
      space: { xsmall, large },
    },
  }) => `${xsmall} ${large}`};

  &:hover,
  &:focus,
  &.active {
    ${ApixHeading} {
      color: ${({ theme }) => theme.colors.key};
    }
  }
`

export const Main = styled.main`
  padding: ${({ theme }) => theme.space.xxlarge};
`

export const PageLayout = styled.div<SideNavStyleProps>`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: ${({ open }) =>
    open ? '20rem 0 70rem' : '1.5rem 0 70rem'};
  grid-template-areas: 'sidebar divider main';
  position: relative;

  ${Sidebar} {
    grid-area: sidebar;
    padding: 0 ${({ theme }) => theme.space.medium};
    width: 20rem;
    z-index: 0;
  }

  ${AccordionDisclosure} {
    height: auto;
  }

  .codeMarker {
    background: yellow;
    position: absolute;
  }

  .hi {
    background: yellow;
  }

  ${Main} {
    grid-area: main;
  }
`

export const SummaryCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.ui2};
`

export const StatusBeta = styled(Flex)`
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xxsmall};
  color: ${({ theme }) => theme.colors.neutral};
  width: 1.125rem;
  height: 1.125rem;
`
