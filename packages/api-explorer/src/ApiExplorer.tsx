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

import type { FC } from 'react'
import React, { useReducer, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router'
import styled, { createGlobalStyle } from 'styled-components'
import { Aside, ComponentsProvider, Layout, Page } from '@looker/components'
import type { SpecList } from '@looker/sdk-codegen'
import type { RunItSetter } from '@looker/run-it'
import { funFetch, fallbackFetch, OAuthScene } from '@looker/run-it'
import { SearchContext, LodeContext, defaultLodeContextValue } from './context'
import type { IApixEnvAdaptor } from './utils'
import {
  EnvAdaptorConstants,
  getLoded,
  oAuthPath,
  registerEnvAdaptor,
  unregisterEnvAdaptor,
} from './utils'
import { Header, SideNav, ErrorBoundary, Loader } from './components'
import {
  specReducer,
  initDefaultSpecState,
  searchReducer,
  defaultSearchState,
  updateSpecApi,
} from './reducers'
import { AppRouter } from './routes'
import { apixFilesHost } from './utils/lodeUtils'
import { useActions } from './hooks'

export interface ApiExplorerProps {
  specs: SpecList
  envAdaptor: IApixEnvAdaptor
  setVersionsUrl: RunItSetter
  exampleLodeUrl?: string
  declarationsLodeUrl?: string
  headless?: boolean
}

export const BodyOverride = createGlobalStyle` html { height: 100%; overflow: hidden; } `

const ApiExplorer: FC<ApiExplorerProps> = ({
  specs,
  envAdaptor,
  setVersionsUrl,
  exampleLodeUrl = 'https://raw.githubusercontent.com/looker-open-source/sdk-codegen/main/examplesIndex.json',
  declarationsLodeUrl = `${apixFilesHost}/declarationsIndex.json`,
  headless = false,
}) => {
  const [initializing, setInitializing] = useState(true)
  const location = useLocation()
  const { setSdkLanguageAction } = useActions()
  const oauthReturn = location.pathname === `/${oAuthPath}`
  const [specState, specDispatch] = useReducer(
    specReducer,
    initDefaultSpecState(specs, location)
  )
  const { spec } = specState
  const [searchSettings, setSearchSettings] = useReducer(
    searchReducer,
    defaultSearchState
  )

  const [lode, setLode] = useState(defaultLodeContextValue)

  const [hasNavigation, setHasNavigation] = useState(true)
  const toggleNavigation = (target?: boolean) =>
    setHasNavigation(target || !hasNavigation)

  const hasNavigationToggle = useCallback((e: MessageEvent<any>) => {
    if (e.origin === window.origin && e.data.action === 'toggle_sidebar') {
      setHasNavigation((currentHasNavigation) => !currentHasNavigation)
    }
  }, [])

  useEffect(() => {
    registerEnvAdaptor(envAdaptor)
    setInitializing(false)

    return () => unregisterEnvAdaptor()
  }, [])

  useEffect(() => {
    if (headless) {
      window.addEventListener('message', hasNavigationToggle)
    }
    return () => {
      if (headless) {
        window.removeEventListener('message', hasNavigationToggle)
      }
    }
  }, [headless, hasNavigationToggle])

  useEffect(() => {
    const loadSpec = async () => {
      if (!spec.api) {
        try {
          const newSpec = { ...spec }
          const api = await fallbackFetch(newSpec, funFetch)
          if (api) {
            spec.api = api
            specDispatch(updateSpecApi(spec.key, api))
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    if (!oauthReturn) {
      loadSpec()
    }
  }, [spec, location])

  useEffect(() => {
    getLoded(exampleLodeUrl, declarationsLodeUrl).then((resp) => setLode(resp))
  }, [exampleLodeUrl, declarationsLodeUrl])

  useEffect(() => {
    const initSdkLanguage = async () => {
      const resp = await envAdaptor.localStorageGetItem(
        EnvAdaptorConstants.LOCALSTORAGE_SDK_LANGUAGE_KEY
      )
      if (resp) {
        setSdkLanguageAction(resp)
      }
    }
    initSdkLanguage()
  }, [envAdaptor, setSdkLanguageAction])

  const themeOverrides = envAdaptor.themeOverrides()

  return (
    <>
      <ComponentsProvider
        loadGoogleFonts={themeOverrides.loadGoogleFonts}
        themeCustomizations={themeOverrides.themeCustomizations}
      >
        {initializing ? (
          <Loader message="Initializing" themeOverrides={themeOverrides} />
        ) : (
          <ErrorBoundary logError={envAdaptor.logError.bind(envAdaptor)}>
            <LodeContext.Provider value={{ ...lode }}>
              <SearchContext.Provider
                value={{ searchSettings, setSearchSettings }}
              >
                <Page style={{ overflow: 'hidden' }}>
                  {!headless && (
                    <Header
                      specs={specs}
                      spec={spec}
                      specDispatch={specDispatch}
                      toggleNavigation={toggleNavigation}
                    />
                  )}
                  <Layout hasAside height="100%">
                    {hasNavigation && (
                      <AsideBorder pt="large" width="20rem">
                        <SideNav
                          headless={headless}
                          specs={specs}
                          spec={spec}
                          specDispatch={specDispatch}
                        />
                      </AsideBorder>
                    )}
                    {oauthReturn && <OAuthScene />}
                    {!oauthReturn && spec.api && (
                      <AppRouter
                        api={spec.api}
                        specKey={spec.key}
                        specs={specs}
                        toggleNavigation={toggleNavigation}
                        envAdaptor={envAdaptor}
                        setVersionsUrl={setVersionsUrl}
                      />
                    )}
                  </Layout>
                </Page>
              </SearchContext.Provider>
            </LodeContext.Provider>
          </ErrorBoundary>
        )}
      </ComponentsProvider>
      {!headless && <BodyOverride />}
    </>
  )
}

/* Border support for `Aside` coming in @looker/components very soon */
export const AsideBorder = styled(Aside)`
  border-right: 1px solid ${({ theme }) => theme.colors.ui2};
`

export default ApiExplorer
