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
import { List, Link, Text, Tooltip, ListItem } from '@looker/components'
import { findExamples, IExampleMine } from '@looker/sdk-codegen'
import ReactMarkdown from 'react-markdown'

interface DocExamplesProps {
  /** mined examples */
  lode: IExampleMine
  /** Language example should be in */
  language: string
  /** Method operation id */
  operationId: string
}

/**
 * Renders links to source files referencing the operationId in the given language
 */
export const DocExamples: FC<DocExamplesProps> = ({
  lode,
  language,
  operationId,
}) => {
  const examples = findExamples(lode, language, operationId)

  return (
    <>
      {examples && examples.length > 0 && (
        <List>
          {examples.map((example, index) => (
            <ListItem key={index}>
              <Tooltip content={example.tooltip} placement="right">
                <Link href={example.permalink}>
                  <ReactMarkdown source={example.description} />
                </Link>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      )}

      {(!examples || examples.length === 0) && (
        <>
          <Text>
            No examples found for {language}. Please{' '}
            <Link href="https://github.com/looker-open-source/sdk-codegen/tree/master/examples">
              add some!
            </Link>
          </Text>
        </>
      )}
    </>
  )
}
