/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import React, { FC } from 'react'
import AceEditor from 'react-ace'

// TODO Use webpack resolver instead.
/* eslint-disable  @typescript-eslint/ban-ts-ignore,@typescript-eslint/no-unused-vars,@typescript-eslint/no-var-requires,import/no-extraneous-dependencies */
// @ts-ignore
const python = require('ace-builds/src-noconflict/mode-python')
// @ts-ignore
const typescript = require('ace-builds/src-noconflict/mode-typescript')
// @ts-ignore
const kotlin = require('ace-builds/src-noconflict/mode-kotlin')
// @ts-ignore
const swift = require('ace-builds/src-noconflict/mode-swift')
// @ts-ignore
const json = require('ace-builds/src-noconflict/mode-json')
// @ts-ignore
const html = require('ace-builds/src-noconflict/mode-html')
// @ts-ignore
const theme = require('ace-builds/src-noconflict/theme-dracula')
/* eslint-enable  @typescript-eslint/ban-ts-ignore,@typescript-eslint/no-unused-vars,@typescript-eslint/no-var-requires,import/no-extraneous-dependencies */

interface CodeStructureProps {
  code: string
  language: string
  onChange?: (e: string) => void
  fontSize?: number
  width?: string
}

export const CodeStructure: FC<CodeStructureProps> = ({
  code,
  language = 'json',
  onChange,
  fontSize = 16,
  width = 'auto',
}) => (
  <AceEditor
    mode={language.toLowerCase()}
    fontSize={fontSize}
    onChange={onChange}
    readOnly={!onChange}
    showPrintMargin={false}
    showGutter={false}
    tabSize={2}
    width={width}
    theme={'dracula'}
    value={code}
    wrapEnabled={true}
    setOptions={{
      useWorker: false,
    }}
  />
)
