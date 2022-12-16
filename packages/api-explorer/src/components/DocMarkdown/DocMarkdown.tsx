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

import type { FC } from 'react'
import React from 'react'
import { Markdown } from '@looker/code-editor'
import { useSelector } from 'react-redux'
import { getEnvAdaptor } from '@looker/extension-utils'
import { selectSearchPattern } from '../../state'
import { useNavigation } from '../../utils'
import { transformURL } from './utils'

interface DocMarkdownProps {
  source: string
  specKey: string
}

export const DocMarkdown: FC<DocMarkdownProps> = ({ source, specKey }) => {
  const searchPattern = useSelector(selectSearchPattern)
  const { navigate } = useNavigation()

  const linkClickHandler = (pathname: string, url: string) => {
    if (pathname.startsWith(`/${specKey}`)) {
      navigate(pathname)
    } else if (url.startsWith(`/${specKey}`)) {
      navigate(url)
    } else if (url.startsWith('https://')) {
      const adaptor = getEnvAdaptor()
      adaptor.openBrowserWindow(url)
    }
  }
  return (
    <Markdown
      source={source}
      pattern={searchPattern}
      linkClickHandler={linkClickHandler}
      transformLinkUri={transformURL.bind(null, specKey)}
    />
  )
}
