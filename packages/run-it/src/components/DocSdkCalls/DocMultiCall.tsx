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
import { Tab2, Tabs2 } from '@looker/components';
import { CodeCopy } from '@looker/code-editor';

interface DocMultiCallProps {
  /** An object with keys representing the language and values for call syntax */
  calls: Record<string, string>;
}

/**
 * Generates the SDK call syntax for all supported languages
 */
export const DocMultiCall: FC<DocMultiCallProps> = ({ calls }) => (
  <Tabs2>
    {Object.entries(calls).map(([language, callSyntax]) => (
      <Tab2 label={language} key={language}>
        <CodeCopy code={callSyntax} language={language} />
      </Tab2>
    ))}
  </Tabs2>
);
