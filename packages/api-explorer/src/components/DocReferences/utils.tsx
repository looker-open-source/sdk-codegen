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
import React from 'react';
import type { ApiModel, IMethod, IType } from '@looker/sdk-codegen';
import { Link } from 'react-router-dom';
import { RunItHeading } from '@looker/run-it';
import { buildPath, highlightHTML } from '../../utils';

/**
 * Renders a heading and links to all item types
 */
export const DocReferenceItems = (
  heading: string,
  items: (IType | IMethod)[],
  api: ApiModel,
  specKey: string,
  pattern: string
) => {
  if (items.length === 0) return <></>;

  return (
    <>
      <RunItHeading as="h4">{heading}</RunItHeading>
      {items.map((item, index) => (
        <span className="doc-link" key={item.name}>
          {index ? ', ' : ''}
          <Link to={buildPath(api, item, specKey)}>
            {highlightHTML(pattern, item.name)}
          </Link>
        </span>
      ))}
    </>
  );
};
