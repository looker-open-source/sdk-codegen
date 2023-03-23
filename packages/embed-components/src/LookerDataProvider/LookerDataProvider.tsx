/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import React, { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { ThemeService } from '@looker/embed-services'
import type { ITheme } from '@looker/sdk'

export interface LookerDataContext {
  loading: boolean
  defaultTheme?: ITheme
  currentTheme?: ITheme
  themes: ITheme[]
  updateTheme: (seletedThemeName: string) => void
}

export interface LookerDataProviderProps {
  sdk: IAPIMethods
  children?: ReactNode
}

const defaultContextData: LookerDataContext = {
  loading: false,
  themes: [],
  updateTheme: () => {
    // NOOP
  },
}

export const LookerData =
  React.createContext<LookerDataContext>(defaultContextData)

export function LookerDataProvider(props: LookerDataProviderProps) {
  const { children, sdk } = props
  const [themeService, setThemeService] = useState<ThemeService | undefined>()
  const [currentTheme, setCurrentTheme] = useState<ITheme | undefined>()
  const themes = themeService?.themes || []
  const defaultTheme = themeService?.defaultTheme
  const loading = themeService?.loading || false

  useEffect(() => {
    const initialize = async () => {
      if (sdk) {
        const service = new ThemeService(sdk)
        await service.loadThemeData(undefined, 'name')
        setCurrentTheme(service.defaultTheme)
        setThemeService(service)
      }
    }
    initialize()
  }, [sdk])

  const updateTheme = useCallback(
    (selectedThemeName: string) => {
      const selectedTheme = themes.find(
        (theme) => theme.name === selectedThemeName
      )
      if (selectedTheme) {
        setCurrentTheme(selectedTheme)
      }
    },
    [themes]
  )

  const lookerData = {
    loading,
    currentTheme,
    themes,
    defaultTheme,
    updateTheme,
  }

  return (
    <LookerData.Provider value={lookerData}>{children}</LookerData.Provider>
  )
}
