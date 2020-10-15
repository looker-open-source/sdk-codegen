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

import React, { BaseSyntheticEvent, FC, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import { useHistory } from 'react-router-dom'
import {
  TableHead,
  TableBody,
  TableRow,
  Link,
  ListItem,
} from '@looker/components'

import { SearchContext } from '../../context'
import { ApixHeading } from '../common'
import { highlightMarkdown, transformURL } from './utils'
import { MDCodeBlockWrapper } from './MDCodeBlockWrapper'
import { TableCell } from './TableCell'
import { MDCode, MDList, MDParagraph, MDTable } from './common'

interface DocMarkdownProps {
  source: string
  specKey: string
}

export const DocMarkdown: FC<DocMarkdownProps> = ({ source, specKey }) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)
  const history = useHistory()

  const handleClick = (e: BaseSyntheticEvent) => {
    if (
      e.target.tagName === 'A' &&
      e.target.pathname.startsWith(`/${specKey}`)
    ) {
      e.preventDefault()
      history.push(e.target.pathname)
    }
  }

  return (
    <span onClick={handleClick}>
      <ReactMarkdown
        source={highlightMarkdown(pattern, source)}
        escapeHtml={false}
        transformLinkUri={transformURL.bind(null, specKey)}
        renderers={{
          code: MDCodeBlockWrapper,
          heading: ApixHeading,
          paragraph: MDParagraph,
          inlineCode: MDCode,
          link: Link,
          list: MDList,
          listItem: ListItem,
          table: MDTable,
          tableHead: TableHead,
          tableBody: TableBody,
          tableRow: TableRow,
          tableCell: TableCell,
        }}
      />
    </span>
  )
}
