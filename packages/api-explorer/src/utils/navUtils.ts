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
import type { History } from 'history'

export const navigate = (
  route: string,
  history: History,
  newParams: { search?: string } | null | undefined
): void => {
  const curParams = new URLSearchParams(history.location.search)
  if (typeof newParams === 'undefined') {
    // if params passed in is undefined, maintain existing params in URL
    history.push({ pathname: route, search: curParams.toString() })
  } else if (!newParams || Object.keys(newParams).length === 0) {
    // if params passed in is null or empty, remove all params from URL
    history.push({ pathname: route })
  } else {
    // if we have new parameters passed in, push to URL
    history.push({ pathname: route, search: newParams.search })
  }
}
