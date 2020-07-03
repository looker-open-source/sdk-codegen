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

import React, { FC, useReducer, useState } from 'react'
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Box,
  ComponentsProvider,
} from '@looker/components'
import styled from 'styled-components'
import { ApiModel, KeyedCollection } from '@looker/sdk-codegen'
import { TryItCallback } from '@looker/try-it'

import { SearchContext } from './context'
import { ExplorerStyle, Header, SideNav, SideNavToggle } from './components'
import {
  specReducer,
  initDefaultSpecState,
  searchReducer,
  defaultSearchState,
} from './reducers'
import { AppRouter } from './routes'

export interface SpecItem {
  status: 'current' | 'deprecated' | 'experimental' | 'stable'
  isDefault?: boolean
  api?: ApiModel
  specURL?: string
  specContent?: string
}

export type SpecItems = KeyedCollection<SpecItem>

export interface ApiExplorerProps {
  tryItCallback?: TryItCallback
  specs: SpecItems
}

const ApiExplorer: FC<ApiExplorerProps> = ({ specs, tryItCallback }) => {
  const [spec, specDispatch] = useReducer(
    specReducer,
    initDefaultSpecState(specs)
  )
  const [searchSettings, setSearchSettings] = useReducer(
    searchReducer,
    defaultSearchState
  )

  const [isSideNavOpen, setSideNavOpen] = useState(true)
  const handleSideNavToggle = () => {
    setSideNavOpen(!isSideNavOpen)
  }

  return (
    <ComponentsProvider>
      <ExplorerStyle />
      <SearchContext.Provider value={{ searchSettings, setSearchSettings }}>
        <Header specs={specs} spec={spec} specDispatch={specDispatch} />
        <PageLayout open={isSideNavOpen}>
          {isSideNavOpen && <SideNav api={spec.api} specKey={spec.key} />}
          <SidebarDivider open={isSideNavOpen}>
            <SideNavToggle
              onClick={handleSideNavToggle}
              isOpen={isSideNavOpen}
              headerHeight="84px"
            />
          </SidebarDivider>
          <Box className={isSideNavOpen ? 'doc open' : 'doc'}>
            <AppRouter
              api={spec.api}
              specKey={spec.key}
              tryItCallback={tryItCallback}
            />
          </Box>
        </PageLayout>
      </SearchContext.Provider>
    </ComponentsProvider>
  )
}

export default ApiExplorer

interface SidebarStyleProps {
  open: boolean
}

const SidebarDivider = styled.div<SidebarStyleProps>`
  transition: border 0.3s;
  border-left: 1px solid
    ${({ theme, open }) =>
      open ? theme.colors.palette.charcoal200 : 'transparent'};
  grid-area: divider;
  overflow: visible;
  position: relative;
  &:hover {
    border-left: 1px solid
      ${({ theme, open }) =>
        open
          ? theme.colors.palette.charcoal300
          : theme.colors.palette.charcoal200};
  }
`

const PageLayout = styled.div<SidebarStyleProps>`
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
    padding: 0 ${(props) => props.theme.space.medium} !important;

    button {
      color: ${(props) => props.theme.colors.palette.charcoal700};
      cursor: pointer;
      min-height: 2.25rem;

      &:hover,
      &:focus,
      &[aria-expanded='true'] {
        color: ${(props) => props.theme.colors.palette.purple400};
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

  ${SidebarGroup} {
    > div {
      border-left: 1px dashed
        ${(props) => props.theme.colors.palette.charcoal200};
      padding: ${(props) => props.theme.space.xxsmall} 0
        ${(props) => props.theme.space.xxsmall}
        ${(props) => props.theme.space.xsmall};
    }
  }

  ${SidebarItem} {
    font-size: ${(props) => props.theme.fontSizes.small};

    & {
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: ${(props) => props.theme.space.xsmall}
        ${(props) => props.theme.space.xsmall} !important;
    }

    &:hover,
    &:focus,
    .active & {
      background-color: ${(props) =>
        props.theme.colors.palette.charcoal100} !important;
    }

    .active & {
      font-weight: 600;
    }
  }

  .doc {
    grid-area: main;
  }
`
