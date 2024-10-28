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

import type { IMethodResponse, KeyedCollection } from '@looker/sdk-codegen';

/**
 * Given an array of method responses, group them by statusCode. The value of each status code is a collection of
 * media types (keys) and responses (values)
 * @param responses An array of method responses
 */
export const buildResponseTree = (
  responses: IMethodResponse[]
): KeyedCollection<KeyedCollection<IMethodResponse>> => {
  const tree: KeyedCollection<KeyedCollection<IMethodResponse>> = {};
  Object.values(responses).forEach(response => {
    const node = `${response.statusCode}: ${response.description}`;
    if (!(node in tree)) tree[node] = {};
    tree[node][response.mediaType] = response;
  });
  return tree;
};
