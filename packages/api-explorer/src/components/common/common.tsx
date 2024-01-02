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
import React, { useEffect } from 'react';
import type { SectionProps } from '@looker/components';
import { Section } from '@looker/components';
import { useWindowSize } from '../../utils';
import { HEADER_REM } from '../Header';

export const REM_TO_PX = 16;

/**
 * Extends the looker Section to proper height and scrolls to top on use
 * @param props - anything you want, but probably SectionProps
 */
export const ApixSection: FC<SectionProps> = (props: any) => {
  const size = useWindowSize();
  const sectionH = size.height - REM_TO_PX * HEADER_REM;
  useEffect(() => {
    document.getElementById('top')?.scrollTo(REM_TO_PX * HEADER_REM, 0);
  }, [props]);

  return (
    <Section
      {...props}
      id="top"
      p="xxlarge"
      style={{ height: `${sectionH}px`, overflow: 'auto', borderTop: '0px' }}
    />
  );
};
