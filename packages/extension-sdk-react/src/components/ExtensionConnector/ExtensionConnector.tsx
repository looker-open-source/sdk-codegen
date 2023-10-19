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

import isEqual from 'lodash/isEqual'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { RawVisualizationData, TileHostData } from '@looker/extension-sdk'
import { connectExtensionHost } from '@looker/extension-sdk'
import { ErrorMessage } from '../ErrorMessage'
import { RouteChangeListener } from '../RouteChangeListener'
import { getInitialRouteEntries } from '../utils/get_initial_route_entries'
import { setupClosePopoversListener } from '../utils/setup_close_popovers'
import type { ExtensionConnectorProps, RouteData } from './types'

/**
 * ExtensionConnector component. Provides access to the extension API and SDK (use
 * ExtensionContext) and react routing services.
 */
export const ExtensionConnector: React.FC<ExtensionConnectorProps> = ({
  contextData,
  updateContextData,
  connectedCallback,
  unloadedCallback,
  onPathnameChange,
  onRouteChange,
  hostTracksRoute = true,
  loadingComponent,
  requiredLookerVersion,
  chattyTimeout,
  children,
}) => {
  const contextDataRef = useRef(contextData)
  const [initialRouteData, setInitialRouteData] = useState<RouteData>()
  const [hostRouteData, setHostRouteData] = useState<RouteData>({ route: '' })
  const [initializing, setInitializing] = useState(true)
  const [initializeError, setInitializeError] = useState<string>()

  useEffect(() => {
    contextDataRef.current = contextData
  }, [contextData])

  const setInitialRouteAndRouteState = useCallback(
    (route: string, routeState?: any) => {
      if (hostTracksRoute) {
        setInitialRouteData({ route, routeState })
      }
    },
    [hostTracksRoute, setInitialRouteData]
  )

  const hostChangedRoute = useCallback(
    (_route: string, routeState?: any) => {
      const route = _route.startsWith('/') ? _route : '/' + _route
      if (
        route !== hostRouteData.route ||
        !isEqual(routeState, hostRouteData.routeState)
      ) {
        setHostRouteData({ route, routeState })
        updateContextData({
          route,
          routeState,
        })
      }
    },
    [setHostRouteData, updateContextData]
  )

  const visualizationDataReceivedCallback = useCallback(
    (visualizationData: RawVisualizationData) => {
      updateContextData({
        visualizationData,
      })
    },
    [updateContextData]
  )

  const tileHostDataChangedCallback = useCallback(
    (partialHostData: Partial<TileHostData>) => {
      if (contextDataRef.current.tileSDK) {
        const { tileSDK } = contextDataRef.current
        tileSDK.tileHostDataChanged(partialHostData)
        updateContextData({
          tileHostData: tileSDK.tileHostData,
        })
      }
    },
    [updateContextData]
  )

  useEffect(() => {
    const initialize = async () => {
      try {
        const extensionHost = await connectExtensionHost({
          setInitialRoute: setInitialRouteAndRouteState,
          requiredLookerVersion,
          hostChangedRoute,
          chattyTimeout,
          visualizationDataReceivedCallback,
          tileHostDataChangedCallback,
        })
        connectedCallback(extensionHost)
        setInitializing(false)
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(error)
        setInitializeError(error.message || 'Extension failed to initialize.')
        setInitializing(false)
      }
    }
    initialize()
    return () => {
      unloadedCallback()
    }
  }, [])

  useEffect(() => {
    return initializing
      ? undefined
      : setupClosePopoversListener(contextData.extensionSDK)
  }, [initializing])

  return (
    <>
      {initializing ? (
        loadingComponent
      ) : (
        <>
          {initializeError ? (
            <ErrorMessage errorMessage={initializeError} />
          ) : (
            <>
              {hostTracksRoute ? (
                <MemoryRouter
                  initialEntries={getInitialRouteEntries(initialRouteData)}
                >
                  <RouteChangeListener
                    onRouteChange={onRouteChange}
                    onPathnameChange={onPathnameChange}
                    extensionHost={contextData!.extensionSDK}
                    hostRoute={hostRouteData.route}
                    hostRouteState={hostRouteData.routeState}
                  />
                  {children}
                </MemoryRouter>
              ) : (
                <>{children}</>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
