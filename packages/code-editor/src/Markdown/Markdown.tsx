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

import type { BaseSyntheticEvent, ReactNode } from 'react';
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import { Link, TableBody, TableHead, TableRow } from '@looker/components';

import { CodeDisplay } from '../CodeDisplay';
import { prepareCodeText, qualifyMarkdownText } from './utils';
import { TableCell } from './TableCell';
import { MDHeading, MDList, MDListItem, MDParagraph, MDTable } from './common';

type HeadingLevels = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface MarkdownProps {
  source: string;
  pattern?: string;
  transformLinkUri?: (url: string) => string;
  linkClickHandler?: (pathname: string, href: string) => void;
  paragraphOverride?: ({ children }: { children: ReactNode }) => ReactNode;
}

export const Markdown = ({
  source,
  pattern = '',
  transformLinkUri,
  linkClickHandler,
  paragraphOverride,
}: MarkdownProps) => {
  const findAnchor = (ele: HTMLElement): HTMLAnchorElement | undefined => {
    if (ele.tagName === 'A') return ele as HTMLAnchorElement;
    if (ele.parentElement) {
      return findAnchor(ele.parentElement);
    }
    return undefined;
  };

  const handleClick = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (linkClickHandler) {
      // Could be a <mark> tag wrapped by an anchor
      const a = findAnchor(e.target);
      if (a) {
        linkClickHandler(
          a.getAttribute('pathname') || '',
          a.getAttribute('href') || ''
        );
      }
    }
  };

  const heading = ({
    level,
    children,
  }: {
    level: number;
    children: ReactNode;
  }) => <MDHeading as={`h${level}` as HeadingLevels}>{children}</MDHeading>;

  const paragraph = ({ children }: { children: ReactNode }) => (
    <MDParagraph>{children}</MDParagraph>
  );

  const code = ({
    inline,
    children,
  }: {
    inline?: boolean;
    children: ReactNode;
  }) => {
    const { text, language } = prepareCodeText(children?.toString() || '');
    const codeProps = {
      language: language,
      code: text,
      pattern: pattern,
      lineNumbers: false,
      inline: inline,
    };
    return <CodeDisplay {...codeProps} />;
  };

  const components = {
    h1: heading,
    h2: heading,
    h3: heading,
    h4: heading,
    h5: heading,
    h6: heading,
    p: paragraphOverride || paragraph,
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
    th: TableCell,
  };

  return (
    <MarkdownWrapper onClick={handleClick}>
      <ReactMarkdown
        remarkPlugins={[gfm]}
        rehypePlugins={[rehypeRaw]}
        transformLinkUri={transformLinkUri}
        components={components}
      >
        {qualifyMarkdownText(source, pattern)}
      </ReactMarkdown>
    </MarkdownWrapper>
  );
};

const MarkdownWrapper = styled.div`
  & > ul {
    padding-left: 20px;
    list-style: disc outside;
  }
  & > ol {
    padding-left: 20px;
    list-style: decimal outside;
  }
  & mark {
    background-color: #fff2c2;
    font-weight: 500;
  }
`;
