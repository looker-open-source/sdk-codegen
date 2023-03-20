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
import { Select } from '@looker/components'
import type { Themes } from '@looker/embed-services'
import type { SelectOptionObject } from '@looker/components'

interface SelectThemeProps {
  service: Themes
  onChange: (theme: string) => void
}

export const SelectTheme = ({ service, onChange }: SelectThemeProps) => {
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState('')
  const [options, setOptions] = useState<SelectOptionObject[]>()

  useEffect(() => {
    // TODO: move into init service method
    const getDefaultTheme = async () => {
      const defaultTheme = await service.getDefault()
      if (defaultTheme?.name) {
        setValue(defaultTheme.name)
      }
    }

    const getAllThemes = async () => {
      const allThemes = await service.getAll()
      const options: SelectOptionObject[] = []
      Object.values(allThemes).forEach((theme) => {
        options.push({
          value: theme.name!,
          label: theme.name,
        })
      })
      setOptions(options)
    }

    getDefaultTheme()
    getAllThemes()
    setLoading(false)
  }, [])

  const handleChange = (theme: string) => {
    setValue(theme)
    onChange(theme)
    // ThemeService.activeTheme(theme)
  }

  return (
    <Select
      isLoading={loading}
      value={value}
      options={options}
      onChange={handleChange}
    />
  )
}
