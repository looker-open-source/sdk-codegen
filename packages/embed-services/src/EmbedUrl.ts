/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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

/**
 * A class for use when implementer requires components to be context aware
 */
export class EmbedUrl {
  /** Returns the whole url of the current page */
  static url() {
    return window.location.href
  }

  /** Returns the path of the current page */
  static path() {
    return window.location.pathname
  }

  /** Returns the query params of the current URL */
  static queryParams() {
    return window.location.search
  }

  /** Determines whether the current URL is a dashboard url */
  static isDashboard() {
    return this.path().startsWith('/dashboards/')
  }

  /** Determines whether the current URL is an explore url */
  static isExplore() {
    return this.path().startsWith('/explore/')
  }

  /** Determines whether the current URL is a Look url */
  static isLook() {
    return this.path().startsWith('/looks/')
  }
}
