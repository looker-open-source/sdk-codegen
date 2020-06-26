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
  Code,
  Heading,
  Paragraph,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Link,
  ListItem,
  List,
} from '@looker/components'

import { SearchContext } from '../../context'
import { highlightMarkdown, transformURL } from './utils'
import { TableCell } from './TableCell'
import { CodeBlockWrapper } from './CodeBlock'

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
      e.target.origin === window.location.origin
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
          heading: Heading,
          paragraph: Paragraph,
          inlineCode: Code,
          code: CodeBlockWrapper,
          link: Link,
          list: List,
          listItem: ListItem,
          table: Table,
          tableHead: TableHead,
          tableBody: TableBody,
          tableRow: TableRow,
          tableCell: TableCell,
        }}
      />
    </span>
  )
}
