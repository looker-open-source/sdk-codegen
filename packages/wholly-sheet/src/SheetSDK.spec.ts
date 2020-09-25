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

import * as fs from 'fs'
import path from 'path'
import { NodeTransport, DefaultSettings } from '@looker/sdk-rtl'
import { SheetSDK } from './SheetSDK'

const credFile = path.join(__dirname, '/', 'google-creds.json')
const creds = fs.readFileSync(credFile, { encoding: 'utf-8' })
const cred = JSON.parse(creds)
const transport = new NodeTransport(DefaultSettings())

describe('SheetConnection', () => {
  test('can connect', async () => {
    const sheets = new SheetSDK(transport, cred.api_key, cred.sheet_id)
    const actual = await sheets.values()
    expect(actual).toBeDefined()
    expect(actual.range).toBeDefined()
    // const actual = await SheetConnection.build(creds)
  })
})
