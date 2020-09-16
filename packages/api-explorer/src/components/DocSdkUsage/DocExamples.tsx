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
import { List, Link, Text, Tooltip, ListItem } from '@looker/components'
import {
  exampleLink,
  IExampleLink,
  IFileCall,
  IMine,
} from '@looker/sdk-codegen'
import { LodeContext } from '../../context'

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const lode = require('../../../../../examples/motherlode.json')

interface DocExamplesProps {
  /** Language example should be in */
  language: string
  /** Method operation id */
  operationId: string
}

const getLanguageExtension = (language: string) => {
  switch (language.toLowerCase()) {
    case 'typescript':
      return '.ts'
    case 'csharp':
    case 'c#':
      return '.cs'
    case 'ruby':
      return '.rb'
    case 'python':
      return '.py'
    case 'swift':
      return '.swift'
    case 'kotlin':
      return '.kt'
    case 'dart':
      return '.dart'
    case 'go':
      return '.go'
    default:
      return ''
  }
}

/**
 * Searches for examples containing operationId usages in the given language
 * @param lode All example data
 * @param language Language example should be in
 * @param operationId Method's operationId to search for
 */
export const findExamples = (
  lode: IMine,
  language: string,
  operationId: string
): IExampleLink[] => {
  const allMethodExamples = lode.nuggets[operationId]
  const ext = getLanguageExtension(language)
  const links: IExampleLink[] = []

  if (allMethodExamples && ext) {
    const calls = allMethodExamples.calls[ext]
    if (calls) {
      calls.forEach((call: IFileCall) => {
        const link = exampleLink(lode, call)
        if (link) {
          links.push(exampleLink(lode, call))
        }
      })
    }
  }
  return links.sort((a, b) => a.permalink.localeCompare(b.permalink))
}

// TODO: asynchronously fetch index at first render. Report if not available in this component
// TODO don't show the SDK Examples card at all if no examples are loaded. This keeps API Explorer more agnostic for other adopters.
/**
 * Renders links to source files referencing the operationId in the given language
 */
export const DocExamples: FC<DocExamplesProps> = ({
  language,
  operationId,
}) => {
  const lode = useContext(LodeContext)
  const examples = findExamples(lode, language, operationId)

  return (
    <>
      {examples && examples.length > 0 && (
        <List>
          {examples.map((example, index) => (
            <ListItem key={index}>
              <Tooltip content={example.tooltip}>
                <Link href={example.permalink}>{example.description}</Link>
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
