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
import { Sidebar, SidebarGroup, SidebarItem, Box } from '@looker/components'
import styled from 'styled-components'
import { BrowserRouter as Router } from 'react-router-dom'
import { ApiModel, KeyedCollection } from '@looker/sdk-codegen'
import { SearchContext } from './context'
import { Header, SideNav, SideNavToggle } from './components'
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
  // request provider
  specs: SpecItems
}

const App: FC<ApiExplorerProps> = ({ specs }) => {
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
    <SearchContext.Provider value={{ searchSettings, setSearchSettings }}>
      <Router>
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
            <AppRouter api={spec.api} specKey={spec.key} />
          </Box>
        </PageLayout>
      </Router>
    </SearchContext.Provider>
  )
}

export default App

interface SidebarStyleProps {
  open: boolean
}

const SidebarDivider = styled.div<SidebarStyleProps>`
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

      span {
        border: 1px solid ${({ theme }) => theme.colors.ui2};
      }
    }
  }

  ${SidebarItem} {
    font-size: ${({ theme }) => theme.fontSizes.small};

    & {
      border-radius: 4px;
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
