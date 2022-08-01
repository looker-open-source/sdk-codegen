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
import React, { useContext, useEffect, useState } from 'react'
import { RunItProvider } from '@looker/run-it'
import type { ExtensionContextData } from '@looker/extension-sdk-react'
import { ExtensionContext } from '@looker/extension-sdk-react'
import { ApiExplorer, store } from '@looker/api-explorer'
import { Provider } from 'react-redux'
import { ExtensionAdaptor } from '@looker/extension-utils'
import { useLocation } from 'react-router-dom'

export const ExtensionApiExplorer: FC = () => {
  const { extensionSDK, core40SDK } =
    useContext<ExtensionContextData>(ExtensionContext)
  const location = useLocation()
  const [extensionAdaptor, _] = useState(
    new ExtensionAdaptor(extensionSDK, core40SDK)
  )

  useEffect(() => {
    const { pathname, search } = location
    const qs = search ? `?${search}` : ''
    extensionAdaptor.updateRoute(`${pathname}${qs}`)
  }, [location, extensionAdaptor])

  return (
    <Provider store={store}>
      <RunItProvider basePath="">
        <ApiExplorer adaptor={extensionAdaptor} headless={true} />
      </RunItProvider>
    </Provider>
  )
}
