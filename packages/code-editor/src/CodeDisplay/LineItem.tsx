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

import React, { FC } from 'react'
import { LineItemProps } from './types'

/**
 * Removes <mark /> tags from markdown text
 * @param markedText - the markdown text input that contains <mark /> tags
 */
const removeMarkTag = (markedText: string) => {
  // TODO: set build target to `esnext` and use replaceAll
  return markedText.replace(/<mark>/g, '').replace(/<\/mark>/g, '')
}

/**
 * Takes a 'line of code' as a list of Tokens and returns syntax highlighting styled spans
 * @param key - component identifier
 * @param tokenProps - the style props from prism renderer
 * @param pattern - search pattern to consider
 */
export const LineItem: FC<LineItemProps> = ({ key, tokenProps, pattern }) => {
  const text = tokenProps.children.toLowerCase()
  if (pattern !== '' && text.includes(pattern.toLowerCase())) {
    tokenProps.className += ' match'
    tokenProps.children = removeMarkTag(tokenProps.children)
  }
  return <span key={key} {...tokenProps} />
}