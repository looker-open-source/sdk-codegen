/*

 Copyright 2021-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import type { BaseSyntheticEvent, ReactNode } from 'react';
import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import { Link, TableBody, TableHead, TableRow } from '@looker/components';

import { CodeDisplay } from '../CodeDisplay';
import { isSafeHref, rehypeSanitizeMarkdown } from './sanitize';
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

  const getLinkPathname = (href: string): string => {
    if (!href || href.startsWith('#')) return '';
    try {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
        if (
          typeof window !== 'undefined' &&
          /^https?:/i.test(window.location.protocol)
        ) {
          const parsed = new URL(href);
          return parsed.origin === window.location.origin
            ? parsed.pathname
            : '';
        }
        return '';
      }
      return new URL(href, 'http://localhost').pathname;
    } catch {
      return '';
    }
  };

  const handleClick = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (linkClickHandler) {
      // Could be a <mark> tag wrapped by an anchor
      const a = findAnchor(e.target);
      const href = a?.getAttribute('href') || '';
      if (a && href && isSafeHref(href)) {
        linkClickHandler(getLinkPathname(href), href);
      }
    }
  };

  const safeTransformLinkUri = (uri: string) => {
    const transformed = transformLinkUri ? transformLinkUri(uri) : uri;
    return isSafeHref(transformed)
      ? transformed
      : (undefined as unknown as string);
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
        remarkPlugins={[gfm] as any}
        rehypePlugins={[rehypeRaw, rehypeSanitizeMarkdown] as any}
        transformLinkUri={safeTransformLinkUri}
        components={components}
      >
        {qualifyMarkdownText(source, pattern ?? '')}
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
