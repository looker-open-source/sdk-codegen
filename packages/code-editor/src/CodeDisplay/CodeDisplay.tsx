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

import type { FC } from 'react';
import React from 'react';
import styled from 'styled-components';
import { Span } from '@looker/components';
import Highlight, { defaultProps, Prism } from 'prism-react-renderer';

import { getPrismLanguage, getOverriddenTheme } from '../utils';
import { CodeWrapper } from './CodeWrapper';
import { LineItem } from './LineItem';
import type { CodeDisplayProps } from './types';
(typeof global !== 'undefined' ? (global as any) : (window as any)).Prism =
  Prism;
require('prismjs/components/prism-kotlin');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-swift');
require('prismjs/components/prism-ruby');
require('prismjs/components/prism-markdown');

const Line = styled(Span)`
  display: table-row;
`;

const LineNo = styled(Span)`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

const LineContent = styled(Span)`
  display: table-cell;
  font-family: monospace;
`;

/**
 * Provides a view-only syntax highlighter for all supported SDK languages.
 * @param language - highlighting language
 * @param code - string content to display
 * @param pattern - Search pattern to be marked
 * @param transparent - Flag to provide background styling or not
 * @param inline - Flag to use block or inline code
 * @param lineNumbers - flag to toggle line numbers
 */
export const CodeDisplay: FC<CodeDisplayProps> = ({
  language = 'json',
  code,
  pattern = '',
  transparent = false,
  inline = false,
  lineNumbers = true,
}) => {
  return (
    <Highlight
      {...defaultProps}
      code={code.trim()}
      language={getPrismLanguage(language)}
      theme={getOverriddenTheme(transparent, inline)}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <CodeWrapper className={className} style={style} inline={inline}>
          {tokens.map((line, i) => (
            <Line key={i} {...getLineProps({ line, key: i })}>
              {lineNumbers && <LineNo>{i + 1}</LineNo>}
              <LineContent>
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token, key });
                  return (
                    <LineItem
                      key={key}
                      index={key}
                      tokenProps={tokenProps}
                      pattern={pattern}
                    />
                  );
                })}
              </LineContent>
            </Line>
          ))}
        </CodeWrapper>
      )}
    </Highlight>
  );
};
