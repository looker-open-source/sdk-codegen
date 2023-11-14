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

import { Chatty } from '@looker/chatty'
import { ExtensionHostApiImpl } from './extension_host_api'
import { registerHostApi } from './global_listener'
import type {
  ExtensionHostApi,
  ExtensionHostConfiguration,
  ExtensionInitializationResponse,
  ExtensionNotification,
} from './types'
import { ExtensionEvent } from './types'

/**
 * Connect extension to Looker host. React extensions using the extension-sdk-react
 * package and ExtensionProvider do not need to call this as the ExtensionProvider
 * sets up the connection.
 * @param configuration
 */
export const connectExtensionHost = async (
  configuration: ExtensionHostConfiguration = {}
): Promise<ExtensionHostApi> =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    // Timer to handle the unlikely event that an initialization message
    // is not received from the host. If this happens it's a bug in the
    // host code.
    let initializationTimer: number | undefined = window.setTimeout(
      () =>
        reject(new Error('Failed to establish communication with Looker host')),
      30000
    )
    // Legacy callback to indicate that connection is established
    const { initializedCallback, chattyTimeout } = configuration
    let extensionHost: ExtensionHostApi
    let targetOrigin
    // The initialized function replaces the need the legacy callback as it
    // resolves/rejects the promise that now wraps the chatty promise that
    // was originally returned.
    const initialized = (
      initializationResponse?: ExtensionInitializationResponse
    ) => {
      // An initialization response is expected but the handle notification
      // method can return undefined.
      if (initializationResponse) {
        // The initialization can fail, for example, Looker host is not
        // at the right version.
        const { errorMessage } = initializationResponse
        if (initializedCallback) {
          initializedCallback(errorMessage)
        }
        if (errorMessage) {
          reject(new Error(errorMessage))
        } else {
          resolve(extensionHost)
        }
      } else {
        reject(new Error('Unexpected response from initialization'))
      }
    }
    try {
      // if extension is not sandboxed the following will succeed
      targetOrigin = window.parent.location.origin
    } catch (err) {
      // failure indicates running in a sandboxed environment
      targetOrigin = '*'
    }
    try {
      const chattyHost = await Chatty.createClient()
        .on(
          ExtensionEvent.EXTENSION_HOST_NOTIFICATION,
          (
            message?: ExtensionNotification
          ): ExtensionInitializationResponse | undefined => {
            // Handle messages from the looker host. The first message should
            // be an initialization message containing information about the host
            // and host extension (looker version, extension id for example).
            let messageResponse: ExtensionInitializationResponse | undefined
            if (message) {
              if (initializationTimer) {
                // The initialization timer is present so assume this is an initialization
                // message. The initialization timer is now cleared.
                window.clearTimeout(initializationTimer)
                initializationTimer = undefined
                if (extensionHost) {
                  try {
                    messageResponse = extensionHost.handleNotification(message)
                    initialized(messageResponse)
                  } catch (error) {
                    // Handle invalid extension host initialization failure
                    reject(error)
                  }
                } else {
                  // The extension host should be initialized if we get here
                  // so this should never happen.
                  reject(new Error('Extension host not created'))
                }
              } else {
                // All other extension host messages
                messageResponse = extensionHost.handleNotification(message)
              }
            }
            return messageResponse
          }
        )
        .withTargetOrigin(targetOrigin)
        .withDefaultTimeout(chattyTimeout || 30000)
        .build()
        .connect()
      // Create the extension host (a extension specific wrapper around the
      // chatty host)
      extensionHost = new ExtensionHostApiImpl({
        chattyHost,
        ...configuration,
      })
      // Register the extension host so that global event listeners can send
      // messages to the looker host (for example beforeUnload event).
      registerHostApi(extensionHost)
    } catch (error) {
      window.clearTimeout(initializationTimer)
      initializationTimer = undefined
      reject(error)
    }
  })
