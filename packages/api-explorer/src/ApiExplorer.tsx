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

import React, { FC, useReducer, useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import { Aside, ComponentsProvider, Layout, Page } from '@looker/components'
import { Looker40SDK, Looker31SDK } from '@looker/sdk'
import { SpecList } from '@looker/sdk-codegen'
import { SearchContext, LodeContext, defaultLodeContextValue } from './context'
import { getLoded } from './utils'
import { Header, SideNav } from './components'
import {
  specReducer,
  initDefaultSpecState,
  searchReducer,
  defaultSearchState,
} from './reducers'
import { AppRouter } from './routes'

export interface ApiExplorerProps {
  specs: SpecList
  sdk?: Looker31SDK | Looker40SDK
  lodeUrl?: string
}

const ApiExplorer: FC<ApiExplorerProps> = ({
  specs,
  lodeUrl = 'https://raw.githubusercontent.com/looker-open-source/sdk-codegen/main/motherlode.json',
}) => {
  const location = useLocation()
  const [spec, specDispatch] = useReducer(
    specReducer,
    initDefaultSpecState(specs, location)
  )
  const [searchSettings, setSearchSettings] = useReducer(
    searchReducer,
    defaultSearchState
  )

  const [lode, setLode] = useState(defaultLodeContextValue)

  const [hasNavigation, setHasNavigation] = useState(true)
  const toggleNavigation = (target?: boolean) =>
    setHasNavigation(target || !hasNavigation)

  useEffect(() => {
    getLoded(lodeUrl).then((resp) => setLode(resp))
  }, [lodeUrl])

  return (
    <ComponentsProvider
      loadGoogleFonts
      themeCustomizations={{
        fontFamilies: { brand: 'Google Sans' },
        colors: { key: '#1A73E8' },
      }}
    >
      <LodeContext.Provider value={{ ...lode }}>
        <SearchContext.Provider value={{ searchSettings, setSearchSettings }}>
          <Page>
            <Header
              specs={specs}
              spec={spec}
              specDispatch={specDispatch}
              toggleNavigation={toggleNavigation}
            />
            <Layout hasAside>
              {hasNavigation && (
                <AsideBorder pt="large" width="20rem">
                  <SideNav api={spec.api} specKey={spec.key} />
                </AsideBorder>
              )}
              <AppRouter
                api={spec.api}
                specKey={spec.key}
                specs={specs}
                toggleNavigation={toggleNavigation}
              />
            </Layout>
          </Page>
        </SearchContext.Provider>
      </LodeContext.Provider>
    </ComponentsProvider>
  )
}

/* Border support for `Aside` coming in @looker/components very soon */
export const AsideBorder = styled(Aside)`
  border-right: 1px solid ${({ theme }) => theme.colors.ui2};
`

export default ApiExplorer
