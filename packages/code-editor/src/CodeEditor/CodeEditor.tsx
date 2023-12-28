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
import Editor from 'react-simple-code-editor';

import type { CodeDisplayProps } from '../CodeDisplay/types';
import { CodeDisplay } from '../index';

interface CodeEditorProps extends CodeDisplayProps {
  /** onChange event handler, for Editor functionality */
  onChange: (text: string) => void;
}

/**
 * Extends CodeDisplay functionality to provide
 * Editor functionality for syntax highlighted code blocks
 */
export const CodeEditor: FC<CodeEditorProps> = ({
  code,
  onChange,
  language = 'json',
  pattern = '',
  transparent = false,
  lineNumbers = true,
}) => {
  return (
    <Editor
      value={code.trim()}
      role={'code-editor'}
      onValueChange={onChange}
      highlight={(code: string) => (
        <CodeDisplay
          code={code}
          language={language}
          pattern={pattern}
          transparent={transparent}
          lineNumbers={lineNumbers}
        />
      )}
      padding="1rem"
      style={{
        width: '100%',
        color: '#FFF',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        fontFamily: 'monospace',
      }}
    />
  );
};
