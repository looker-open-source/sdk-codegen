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
import styled from 'styled-components';
import type { TypeTagList } from '@looker/sdk-codegen';
import { SideNavTypes } from './SideNavTypes';

interface TypeTagsProps {
  tags: TypeTagList;
  specKey: string;
  defaultOpen?: boolean;
  className?: string;
}

export const SideNavTypeTags = styled(
  ({ tags, specKey, className, defaultOpen }: TypeTagsProps) => (
    <div className={className}>
      {Object.keys(tags).map((tag) => (
        <SideNavTypes
          key={tag}
          defaultOpen={defaultOpen}
          types={tags[tag]}
          tag={tag}
          specKey={specKey}
        />
      ))}
    </div>
  )
)`
  padding: 0 ${({ theme }) => theme.space.large};
`;
