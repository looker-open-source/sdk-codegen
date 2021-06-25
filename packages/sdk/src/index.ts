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

// Version 21.4

/**
 * Note: functions should be deep-linked from their 4.0/funcs or 3.1/funcs path
 */
import * as models31 from './3.1/models'
import * as funcs31 from './3.1/funcs'
export { models31 }
export { funcs31 }

export { ILooker31SDK } from './3.1/methodsInterface'
export { Looker31SDK } from './3.1/methods'
export { Looker31SDKStream } from './3.1/streams'

export { ILooker40SDK } from './4.0/methodsInterface'
export { Looker40SDK } from './4.0/methods'
export { Looker40SDKStream } from './4.0/streams'

export * from './4.0/funcs'
export * from './4.0/models'

export { sdkVersion, environmentPrefix } from './constants'
export { LookerExtensionSDK } from './extensionSdk'
export { BrowserSettings, LookerBrowserSDK } from './browserSdk'

export { functionalSdk40 } from './4.0/funcs'
export { functionalSdk31 } from './3.1/funcs'
