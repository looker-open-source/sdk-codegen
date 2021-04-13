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
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
// import { Prism } from "prism-react-renderer"
import dracula from 'prism-react-renderer/themes/dracula'

// (typeof global !== "undefined" ? global : window).Prism = Prism
// require("prismjs/components/prism-kotlin")
// require("prismjs/components/prism-csharp")
// require("prismjs/components/prism-swift")

interface PrismEditorProps {
  language: string
  code: string
  pattern: string
}

const Pre = styled.pre`
  padding: 1rem;
  overflow: auto;
`

const Line = styled.div`
  display: table-row;
`

const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`

const LineContent = styled.span`
  display: table-cell;
`

export const PrismEditor: FC<PrismEditorProps> = ({
  language,
  code,
  pattern,
}) => {
  const getPrismLanguage = (language: string) => {
    // TODO revert back to `go` in generator language definitions instead of using this
    if (language === 'golang') {
      return 'go'
    }
    return language as Language
  }

  return (
    <Highlight
      {...defaultProps}
      code={code}
      language={getPrismLanguage(language)}
      theme={dracula}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre className={className} style={style}>
          {tokens.map((line, i) => (
            <Line key={i} {...getLineProps({ line, key: i })}>
              <LineNo>{i + 1}</LineNo>
              <LineContent>
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token, key })
                  const text = tokenProps.children
                  if (pattern !== '' && text.includes(pattern)) {
                    tokenProps.style = {
                      ...tokenProps.style,
                      border: '1px yellow solid',
                      borderRadius: '4px',
                    }
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
}
