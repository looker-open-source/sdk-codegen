/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import type { LookerSDKError, IAPIMethods } from '@looker/sdk-rtl'

/**
 * Default the heading to 'Unknown error' if error.message is blank for any reason
 * @param error for heading
 */
export const errorHeading = (error: LookerSDKError) =>
  error.message || 'Unknown error'

/**
 * this callback function used by the ErrorDoc constructor gets and truncates
 * API error documents for use within API Explorer
 * @param _sdk required as a parameter, but it's ignored in this function
 * @param url of document (either index.json or md) to fetch
 */
export const apiErrorDisplayFetch = async (_sdk: IAPIMethods, url: string) => {
  const fetched = await fetch(url, { mode: 'cors' })
  let result = await fetched.text()
  const stop = result.indexOf('## API Response Type')
  if (stop > 0) {
    result = result.substring(0, stop - 1).trim()
  }
  return result
}
