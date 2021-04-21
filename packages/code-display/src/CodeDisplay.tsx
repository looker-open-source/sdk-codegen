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

import React, { FC } from 'react'
import styled from 'styled-components'
import { Span } from '@looker/components'
import Highlight, { defaultProps } from 'prism-react-renderer'
import Editor from 'react-simple-code-editor'
// import { Prism } from "prism-react-renderer"
import { getPrismLanguage, getOverridenTheme } from './utils'
// TODO enable kotlin, csharp, swift highlighting
// (typeof global !== "undefined" ? global : window).Prism = Prism
// require("prismjs/components/prism-kotlin")
// require("prismjs/components/prism-csharp")
// require("prismjs/components/prism-swift")

interface CodeDisplayProps {
  /** SDK programming language */
  language?: string
  /** Code blob to be highlighted */
  code: string
  /** Pattern to be search (if applicable) */
  pattern?: string
  /** onChange event handler, for Editor functionality */
  onChange?: (text: string) => void
  /** whether or not to render transparent background */
  transparent?: boolean
  height?: string
}

const Pre = styled.pre`
  white-space: pre-wrap;
  overflow: auto;
  // override default margin for Pre
  // so we can set from parent
  margin: 0px;

  // selector for search matches
  .match {
    border: 1px yellow solid;
    border-radius: 4px;
  }
`

const Line = styled.div`
  display: table-row;
`

const LineNo = styled(Span)`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`

const LineContent = styled(Span)`
  display: table-cell;
  font-family: monospace;
`

/**
 * The CodeDisplay provides a useful implementation of prism-react-renderer
 * for Looker apps. Syntax highlighting is available for all supported SDK languages.
 * TODO: LookML syntax highlighting
 */
export const CodeDisplay: FC<CodeDisplayProps> = ({
  language = 'json',
  code,
  pattern = '',
  onChange,
  transparent = false,
}) => {
  const highlighterLang = getPrismLanguage(language)
  const highlight = (code: string) => (
    <Highlight
      {...defaultProps}
      code={code}
      language={highlighterLang}
      theme={getOverridenTheme(transparent)}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre className={className} style={style}>
          {tokens.map((line, i) => (
            <Line key={i} {...getLineProps({ line, key: i })}>
              {language === 'json' || <LineNo>{i + 1}</LineNo>}
              <LineContent>
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token, key })
                  const text = tokenProps.children
                  if (pattern !== '' && text.includes(pattern)) {
                    tokenProps.className += ' match'
                  }
                  return <span key={key} {...tokenProps} />
                })}
              </LineContent>
            </Line>
          ))}
        </Pre>
      )}
    </Highlight>
  )
  if (!onChange) {
    return highlight(code)
  }
  return (
    <Editor
      value={code}
      onValueChange={onChange}
      highlight={highlight}
      padding="1rem"
      style={{
        width: '100%',
        color: '#FFF',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        fontFamily: 'monospace',
      }}
    />
  )
}
