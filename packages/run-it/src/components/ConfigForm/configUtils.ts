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

export const RunItConfigKey = 'RunItConfig'

export const RunItValuesKey = 'RunItValues'

export type StorageLocation = 'session' | 'local'

export interface IStorageValue {
  location: StorageLocation
  value: string
}

export interface RunItConfigurator {
  getStorage: (key: string, defaultValue?: string) => IStorageValue
  setStorage(key: string, value: string, location: 'local' | 'session'): string
  removeStorage(key: string): void
}

// TODO move into its own file and probably completely refactor. This is just an example
export class StandaloneConfigurator implements RunItConfigurator {
  getStorage(key: string, defaultValue = ''): IStorageValue {
    let value = sessionStorage.getItem(key)
    if (value) {
      return {
        location: 'session',
        value,
      }
    }
    value = localStorage.getItem(key)
    if (value) {
      return {
        location: 'local',
        value,
      }
    }
    return {
      location: 'session',
      value: defaultValue,
    }
  }

  setStorage(
    key: string,
    value: string,
    location: 'local' | 'session' = 'session'
  ): string {
    switch (location.toLocaleLowerCase()) {
      case 'local':
        localStorage.setItem(key, value)
        break
      case 'session':
        sessionStorage.setItem(key, value)
        break
    }
    return value
  }

  removeStorage(key: string) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

export const defaultConfigurator = new StandaloneConfigurator()

/**
 * Validates URL and standardizes it
 * @param url to validate
 * @returns the standardized url.origin if it's valid, or an empty string if it's not
 */
export const validateUrl = (url: string) => {
  try {
    const result = new URL(url)
    if (url.endsWith(':')) return url
    return result.origin
  } catch {
    return ''
  }
}

export const validLocation = (location: string) =>
  ['local', 'session'].includes(location.toLocaleLowerCase())
