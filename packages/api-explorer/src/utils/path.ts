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

/**
 * Builds a path matching the route used by MethodScene
 * @param specKey A string to identify the spec in the URL
 * @param tag Corresponding method tag
 * @param methodName A method name
 * @returns a Method path
 */
export const buildMethodPath = (
  specKey: string,
  tag: string,
  methodName: string
) => `/${specKey}/methods/${tag}/${methodName}`

/**
 * Builds a path matching the route used by TypeScene
 * @param specKey A string to identify the spec in the URL
 * @param tag Corresponding type tag
 * @param typeName A type name
 * @returns a Type path
 */
export const buildTypePath = (specKey: string, tag: string, typeName: string) =>
  `/${specKey}/types/${tag}/${typeName}`

export const diffPath = 'diff'
export const oAuthPath = 'oauth'
