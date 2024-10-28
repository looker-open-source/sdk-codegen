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

interface CodeWrapperProps {
  className: string;
  style: any;
  inline: boolean;
  children: any;
}

const Pre = styled.pre`
  white-space: pre-wrap;
  overflow: auto;
  // override default margin for Pre
  // so we can set from parent
  margin: 0px;

  // selector for search matches
  .match {
    background: #000000;
    border: 1px#fff2c2 solid;
    border-radius: 10px;
    padding: 0.15px 4px;
  }
`;
const Code = styled.code`
  // selector for search matches
  .match {
    background-color: yellow;
  }
`;

/**
 * A wrapper for CodeDisplay which applies search highlighting styles on proper container component
 */
export const CodeWrapper: FC<CodeWrapperProps> = ({
  className,
  style,
  inline,
  children,
}) => {
  const Wrapper = inline ? Code : Pre;
  return (
    <Wrapper className={className} style={style}>
      {children}
    </Wrapper>
  );
};
