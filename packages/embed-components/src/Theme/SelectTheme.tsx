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
import React, { useState, useEffect } from 'react'
import { Select, SpaceVertical, ValidationMessage } from '@looker/components'
import type { SelectOptionObject } from '@looker/components'
import { useThemeActions, useThemesStoreState } from './state'

export const SelectTheme = () => {
  const { initialized, themes, selectedTheme, error } = useThemesStoreState()
  const { initAction, loadThemeDataAction, selectThemeAction } =
    useThemeActions()
  const [options, setOptions] = useState<SelectOptionObject[]>()

  useEffect(() => {
    /** initialize theme service */
    initAction()
  }, [])

  useEffect(() => {
    if (initialized) {
      /** If theme service is initialized, load all theme data */
      loadThemeDataAction()
    }
  }, [initialized])

  useEffect(() => {
    const themeOptions: SelectOptionObject[] = []
    themes.forEach((theme) => {
      themeOptions.push({
        value: theme.id!,
        label: theme.name,
      })
    })
    themeOptions.sort((x, y) => x.label!.localeCompare(y.label!))
    setOptions(themeOptions)
  }, [themes])

  const handleChange = (id: string) => {
    selectThemeAction({ id })
  }

  return (
    <SpaceVertical gap="xxxsmall">
      <Select
        disabled={themes.length === 1}
        isLoading={!initialized || (themes.length === 0 && !error)}
        validationType={error ? 'error' : undefined}
        value={selectedTheme.name}
        options={options}
        onChange={handleChange}
      />
      {error && <ValidationMessage type="error" message={error} />}
    </SpaceVertical>
  )
}
