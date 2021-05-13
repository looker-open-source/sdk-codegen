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

import React, { BaseSyntheticEvent, FC, useContext, ReactNode } from 'react'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { TableHead, TableBody, TableRow, Link } from '@looker/components'

import { SearchContext } from '../../context'
import { ApixHeading } from '../common'
import { highlightMarkdown } from './utils'
import { MDCodeBlockWrapper } from './MDCodeBlockWrapper'
import { TableCell } from './TableCell'
import { MDCode, MDList, MDListItem, MDParagraph, MDTable } from './common'

interface MarkdownProps {
  source: string
  transformLinkUri?: (url: string) => string
  linkClickHandler?: (pathname: string, href: string) => void
}

type HeadingLevels = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export const Markdown: FC<MarkdownProps> = ({
  source,
  transformLinkUri,
  linkClickHandler,
}) => {
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)

  const findAnchor = (ele: HTMLElement): HTMLAnchorElement | undefined => {
    if (ele.tagName === 'A') return ele as HTMLAnchorElement
    if (ele.parentElement) {
      return findAnchor(ele.parentElement)
    }
    return undefined
  }

  const handleClick = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    if (linkClickHandler) {
      // Could be a <mark> tag wrapped by an anchor
      const a = findAnchor(e.target)
      if (a) {
        linkClickHandler(a.pathname, a.href)
      }
    }
  }

  const heading = ({
    level,
    children,
  }: {
    level: number
    children: ReactNode
  }) => <ApixHeading as={`h${level}` as HeadingLevels}>{children}</ApixHeading>

  const paragraph = ({ children }: { children: ReactNode }) => (
    <MDParagraph>{children}</MDParagraph>
  )

  const code = ({
    inline,
    children,
  }: {
    inline?: boolean
    children: ReactNode
  }) => {
    if (inline) {
      return <MDCode>{children}</MDCode>
    }
    return <MDCodeBlockWrapper value={children} />
  }

  const components = {
    h1: heading,
    h2: heading,
    h3: heading,
    h4: heading,
    h5: heading,
    h6: heading,
    p: paragraph,
    code: code,
    a: Link,
    ul: MDList,
    ol: MDList,
    link: Link,
    li: MDListItem,
    table: MDTable,
    thead: TableHead,
    tbody: TableBody,
    tr: TableRow,
    td: TableCell,
  }

  return (
    <MarkdownWrapper onClick={handleClick}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        transformLinkUri={transformLinkUri}
        components={components}
      >
        {highlightMarkdown(pattern, source)}
      </ReactMarkdown>
    </MarkdownWrapper>
  )
}

const MarkdownWrapper = styled.div`
  & > ul {
    padding-left: 20px;
    list-style: disc outside;
  }
  & > ol {
    padding-left: 20px;
    list-style: decimal outside;
  }
`
