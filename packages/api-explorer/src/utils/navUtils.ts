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
import type { History } from 'history'

export const navigate = (
  route: string | null,
  newParams: { search?: string },
  history: History
): void => {
  const curParams = new URLSearchParams(history.location.search)
  if (!route) {
    // we are pushing something to current
    history.push({ search: newParams.search })
    return
  }
  if (!newParams) {
    // if it is null, empty params
    history.push({ pathname: route })
  } else if (Object.keys(newParams).length === 0) {
    // if params is empty, leave the path be
    history.push({ pathname: route, search: curParams.toString() })
  } else {
    // push the given parameters
    history.push({ pathname: route, search: newParams.search })
  }
}
