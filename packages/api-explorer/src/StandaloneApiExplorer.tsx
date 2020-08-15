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

import React, { FC } from 'react'
import ApiExplorer, { SpecItems, RuntimeEnvironment } from './ApiExplorer'
import { IStorageValue } from '@looker/run-it'

export interface StandloneApiExplorerProps {
  specs: SpecItems
}

// TODO ExtensionApiExplorer passes in a runit callback. This should do the same.
// Basically all logic related to run it should be driven by the high level components
// wrapping API explorer. Not sure runit callback is a great name, perhaps just
// pass in the SDK (extension passes in extension SDK, standalone passes in Browser SDK)
// might need some additional flag to indicate that authentication is required.

// TODO move into its own file and probably completely refactor. This is just an example
class StandaloneRuntimeEnvironment implements RuntimeEnvironment {
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

export const StandaloneApiExplorer: FC<StandloneApiExplorerProps> = ({
  specs,
}) => {
  return (
    <ApiExplorer
      specs={specs}
      runtimeEnvironment={new StandaloneRuntimeEnvironment()}
    />
  )
}
