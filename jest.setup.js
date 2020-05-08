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

import Adapter from 'enzyme-adapter-react-16'
import { configure } from 'enzyme'

require('@testing-library/jest-dom/extend-expect')
require('jest-canvas-mock')
require('jest-styled-components')

configure({ adapter: new Adapter() })

const observeMock = function (cb, config) {
  this.observeCallback = cb
  this.observeConfig = config
  this.disconnect = jest.fn()
  this.observe = jest.fn()
}

const globalAny = global
globalAny.IntersectionObserver = observeMock

// js-dom doesn't do scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

beforeAll(() => {
  jest.resetAllMocks()
})
