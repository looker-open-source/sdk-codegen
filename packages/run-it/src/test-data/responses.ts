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

import { IRawResponse } from '@looker/sdk-rtl/lib/browser'

export const testJsonResponse: IRawResponse = {
  url: 'https://some/json/data',
  contentType: 'application/json',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('[{"key1": "value1" }]'),
}

export const testTextResponse: IRawResponse = {
  url: 'https://some/text/data',
  contentType: 'text/plain;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some text data'),
}

export const testHtmlResponse: IRawResponse = {
  url: `https://some/html`,
  contentType: 'text/html;charset=utf-8',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from(
    '<table>\n' +
      '<tr><th>Orders Created Date</th><th>Orders Count</th></tr>\n' +
      '<tr><td>2019-12-22</td><td>39</td></tr>\n' +
      '</table>'
  ),
}

export const testImageResponse = (contentType = 'image/png'): IRawResponse => ({
  url: `http://${contentType}`,
  contentType,
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some image data'),
})

export const testUnknownResponse: IRawResponse = {
  url: 'http://bogus',
  contentType: 'bogus',
  ok: true,
  statusCode: 200,
  statusMessage: 'OK',
  body: Buffer.from('some data'),
}

export const testErrorResponse: IRawResponse = {
  url: 'http://error',
  body: Buffer.from(
    '{"message": "Not found", "documentation_url": "http://docs.looker.com"}'
  ),
  contentType: 'text',
  ok: false,
  statusCode: 404,
  statusMessage: 'some status message',
}
