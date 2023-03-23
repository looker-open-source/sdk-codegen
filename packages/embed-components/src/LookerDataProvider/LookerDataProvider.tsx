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
import React, { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { ThemeService } from '@looker/embed-services'
import type { ITheme } from '@looker/sdk'

export interface LookerDataContext {
  loading: boolean
  defaultTheme?: ITheme
  currentTheme?: ITheme
  themes?: ITheme[]
  loadThemeData: () => void
  updateTheme: (seletedThemeName: string) => void
}

export interface LookerDataProviderProps {
  sdk: IAPIMethods
  children?: ReactNode
}

const noop = () => {
  // NOOP
}

const defaultContextData: LookerDataContext = {
  loading: false,
  themes: [],
  loadThemeData: noop,
  updateTheme: noop,
}

export const LookerData =
  React.createContext<LookerDataContext>(defaultContextData)

export function LookerDataProvider({ children, sdk }: LookerDataProviderProps) {
  const [themeService] = useState<ThemeService>(new ThemeService(sdk))
  const [currentTheme, setCurrentTheme] = useState<ITheme | undefined>()
  const { themes, defaultTheme, loading } = themeService

  const loadThemeData = useCallback(async () => {
    if (!currentTheme) {
      await themeService.loadThemeData(undefined, 'name')
      setCurrentTheme(themeService.defaultTheme)
    }
  }, [currentTheme])

  const updateTheme = useCallback(
    (selectedThemeName: string) => {
      const selectedTheme = themes?.find(
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
    loadThemeData,
    updateTheme,
  }

  return (
    <LookerData.Provider value={lookerData}>{children}</LookerData.Provider>
  )
}
