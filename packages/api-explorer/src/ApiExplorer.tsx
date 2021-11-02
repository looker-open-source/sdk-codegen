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
import {
  Aside,
  ComponentsProvider,
  Divider,
  Heading,
  IconButton,
  Layout,
  Page,
  Space,
} from '@looker/components'
import type { SpecList } from '@looker/sdk-codegen'
import type { RunItSetter } from '@looker/run-it'
import { funFetch, fallbackFetch, OAuthScene } from '@looker/run-it'
import { FirstPage } from '@styled-icons/material/FirstPage'
import { LastPage } from '@styled-icons/material/LastPage'

import type { IEnvironmentAdaptor } from '@looker/extension-utils'
import {
  registerEnvAdaptor,
  unregisterEnvAdaptor,
} from '@looker/extension-utils'
import { oAuthPath } from './utils'
import {
  Header,
  SideNav,
  ErrorBoundary,
  Loader,
  SelectorContainer,
  HEADER_TOGGLE_LABEL,
} from './components'
import { specReducer, initDefaultSpecState, updateSpecApi } from './reducers'
import { AppRouter } from './routes'
import { apixFilesHost } from './utils/lodeUtils'
import {
  useSettingActions,
  useSettingStoreState,
  useLodeActions,
  useLodesStoreState,
} from './state'

export interface ApiExplorerProps {
  specs: SpecList
  adaptor: IEnvironmentAdaptor
  setVersionsUrl: RunItSetter
  examplesLodeUrl?: string
  declarationsLodeUrl?: string
  headless?: boolean
}

const BodyOverride = createGlobalStyle` html { height: 100%; overflow: hidden; } `

export const ApiExplorer: FC<ApiExplorerProps> = ({
  specs,
  adaptor,
  setVersionsUrl,
  examplesLodeUrl = 'https://raw.githubusercontent.com/looker-open-source/sdk-codegen/main/examplesIndex.json',
  declarationsLodeUrl = `${apixFilesHost}/declarationsIndex.json`,
  headless = false,
}) => {
  const { initialized } = useSettingStoreState()
  useLodesStoreState()
  const { initLodesAction } = useLodeActions()
  const { initSettingsAction } = useSettingActions()
  const location = useLocation()
  const oauthReturn = location.pathname === `/${oAuthPath}`
  const [specState, specDispatch] = useReducer(
    specReducer,
    initDefaultSpecState(specs, location)
  )
  const { spec } = specState

  const [hasNavigation, setHasNavigation] = useState(true)
  const toggleNavigation = (target?: boolean) =>
    setHasNavigation(target || !hasNavigation)

  const hasNavigationToggle = useCallback((e: MessageEvent<any>) => {
    if (e.origin === window.origin && e.data.action === 'toggle_sidebar') {
      setHasNavigation((currentHasNavigation) => !currentHasNavigation)
    }
  }, [])

  useEffect(() => {
    registerEnvAdaptor(adaptor)
    initSettingsAction()
    initLodesAction({ examplesLodeUrl, declarationsLodeUrl })

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

  const themeOverrides = adaptor.themeOverrides()

  return (
    <>
      <ComponentsProvider
        loadGoogleFonts={themeOverrides.loadGoogleFonts}
        themeCustomizations={themeOverrides.themeCustomizations}
      >
        {!initialized ? (
          <Loader message="Initializing" themeOverrides={themeOverrides} />
        ) : (
          <ErrorBoundary logError={adaptor.logError.bind(adaptor)}>
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
                <AsideBorder
                  borderRight
                  isOpen={hasNavigation}
                  headless={headless}
                >
                  {headless && (
                    <>
                      <Space
                        alignItems="center"
                        py="u3"
                        px={hasNavigation ? 'u5' : '0'}
                        justifyContent={
                          hasNavigation ? 'space-between' : 'center'
                        }
                      >
                        {hasNavigation && (
                          <Heading
                            as="h2"
                            fontSize="xsmall"
                            fontWeight="bold"
                            color="text2"
                          >
                            API DOCUMENTATION
                          </Heading>
                        )}
                        <IconButton
                          size="xsmall"
                          shape="round"
                          icon={hasNavigation ? <FirstPage /> : <LastPage />}
                          label={HEADER_TOGGLE_LABEL}
                          onClick={() => toggleNavigation()}
                        />
                      </Space>
                      {hasNavigation && (
                        <>
                          <Divider mb="u3" appearance="light" />
                          <SelectorContainer
                            ml="large"
                            mr="large"
                            specs={specs}
                            spec={spec}
                            specDispatch={specDispatch}
                          />
                        </>
                      )}
                    </>
                  )}
                  {hasNavigation && (
                    <SideNav
                      headless={headless}
                      specs={specs}
                      spec={spec}
                      specDispatch={specDispatch}
                    />
                  )}
                </AsideBorder>
                {oauthReturn && <OAuthScene />}
                {!oauthReturn && spec.api && (
                  <AppRouter
                    api={spec.api}
                    specKey={spec.key}
                    specs={specs}
                    toggleNavigation={toggleNavigation}
                    adaptor={adaptor}
                    setVersionsUrl={setVersionsUrl}
                  />
                )}
              </Layout>
            </Page>
          </ErrorBoundary>
        )}
      </ComponentsProvider>
      {!headless && <BodyOverride />}
    </>
  )
}

const AsideBorder = styled(Aside)<{
  isOpen: boolean
  headless: boolean
}>`
  width: ${({ isOpen, headless }) =>
    isOpen ? '20rem' : headless ? '2.75rem' : '0rem'};
`
