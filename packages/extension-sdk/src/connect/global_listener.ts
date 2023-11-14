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

import { logError, logWarn } from '../util'
import type { ExtensionHostApi, ExtensionSDK } from './types'

let _hostApi: ExtensionHostApi | undefined

const errorListener = (event: ErrorEvent) => {
  if (_hostApi) {
    // in development mode errors get reported twice. Suspect react
    // development code re-reporting the error. Before error reporting
    // was working correctly in sandboxed iframe there were two distinct
    // errors on two separate events. After the fix the same error is
    // reported twice on two events. A "looker" property is set on the
    // error object. The second time the listener is called, the error
    // is ignored as it has already been reported.
    if (event.error) {
      if (!event.error._looker_reported) {
        _hostApi.error(event)
        event.error._looker_reported = true
      }
    } else {
      _hostApi.error(event)
    }
  } else {
    logError(
      'Extension has unhandled error. Reporting on console as Looker host api not initialized',
      event
    )
  }
}

/**
 * Listen for unload events and send message to host.
 * Host will reload the extension. Stops new pages being
 * loaded using form submission.
 */
const beforeUnloadListener = () => {
  if (_hostApi) {
    _hostApi.unloaded()
    logWarn('Extension is being unloaded')
  }
}

const setupGlobalListeners = () => {
  window.addEventListener('error', errorListener)
  window.addEventListener('beforeunload', beforeUnloadListener)
}

setupGlobalListeners()

/**
 * Register the api with the error listener.
 */
export const registerHostApi = (hostApi: ExtensionHostApi) => {
  _hostApi = hostApi
}

/**
 * Static reference to extension SDK.
 * Will throw an error if the extensionSDK has not been initialized
 */
export const getExtensionSDK = (): ExtensionSDK => {
  if (_hostApi && _hostApi.lookerHostData) {
    return _hostApi
  }
  throw new Error('ExtensionSDK not initialized')
}
