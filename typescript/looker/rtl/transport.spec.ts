/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Discussion of MIME types at https://en.wikipedia.org/wiki/Media_type#Mime.types

import { ResponseMode, responseMode } from './transport'

const binaryTypes = `application/zip
application/pdf
application/msword
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/vnd.oasis.opendocument.text
multipart/form-data
audio/mpeg
audio/ogg
image/png
image/jpeg
image/gif
font/
audio/
video/
image/`.split('\n')

const textTypes = `application/javascript
application/json
application/x-www-form-urlencoded
application/xml
application/sql
application/graphql
application/ld+json
text/css
text/html
text/xml
text/csv
text/plain
application/vnd.api+json`.split('\n')

describe('Transport', () => {

  describe('Content Type mode', () => {
    it('binary', () => {
      binaryTypes.forEach(x => {
        const actual = responseMode(x)
        if (actual !== ResponseMode.binary) {
          console.log(`${x} is not binary`)
        }
        expect(actual).toEqual(ResponseMode.binary)
      })
    })

    it('text or string', () => {
      textTypes.forEach(x => {
        const actual = responseMode(x)
        if (actual !== ResponseMode.string) {
          console.log(`${x} is not text/string`)
        }
        expect(actual).toEqual(ResponseMode.string)
      })
    })
  })

})
