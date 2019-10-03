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

export const lookerVersion = '6.21'
export const apiVersion = '3.1'
export const sdkVersion = `${apiVersion}.${lookerVersion}`
export const environmentPrefix = 'LOOKERSDK'
export const matchCharset = ';.*charset='

/**
 * Does this content type say it's utf-8?
 * @type {string} Regular expression for matching charset=utf-8 in Content-Type
 */
export const matchCharsetUtf8 = `${matchCharset}.*\\butf-8\\b`

/**
 * Matching rules for string/text types. String matches must be checked *before* binary matches
 * @type {string} Regular expression for matching Content-Type headers
 */
export const matchModeString = `(^application\\/.*(\\bjson\\b|\\bxml\\b|\\bsql\\b|\\bgraphql\\b|\\bjavascript\\b|\\bx-www-form-urlencoded\\b)|^text\\/|${matchCharset})`

/**
 * Matching rules for all binary or unknown types. Binary matches must be checked *after* string matches
 * @type {string} Regular expression for matching Content-Type headers
 */
export const matchModeBinary = '^image\\/|^audio\\/|^video\\/|^font\\/|^application\\/|^multipart\\/'
