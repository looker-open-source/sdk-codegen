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

import React, { FC, useContext } from 'react'
import AceEditor from 'react-ace'

import { findGenerator } from '@looker/sdk-codegen'
import { SearchContext } from '../../context/search'
import { highlightSourceCode } from './utils'

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
const csharp = require('ace-builds/src-noconflict/mode-csharp')
// @ts-ignore
const json = require('ace-builds/src-noconflict/mode-json')
// @ts-ignore
const theme = require('ace-builds/src-noconflict/theme-dracula')
/* eslint-enable  @typescript-eslint/ban-ts-ignore,@typescript-eslint/no-unused-vars,@typescript-eslint/no-var-requires,import/no-extraneous-dependencies */

interface DocCodeProps {
  code: string
  language?: string
  fontSize?: number
  width?: string
}

export const DocCode: FC<DocCodeProps> = ({
  code,
  language = 'json',
  fontSize = 16,
  width = 'auto',
}) => {
  const gen = findGenerator(language)
  if (gen) language = gen.language.toLocaleLowerCase()
  const {
    searchSettings: { pattern },
  } = useContext(SearchContext)
  const markers = highlightSourceCode(pattern, code)

  return (
    <AceEditor
      mode={language}
      name={language}
      fontSize={fontSize}
      readOnly={true}
      showPrintMargin={false}
      showGutter={false}
      tabSize={2}
      width={width}
      theme={'dracula'}
      value={code}
      wrapEnabled={true}
      markers={markers}
      setOptions={{
        useWorker: false,
      }}
    />
  )
}
