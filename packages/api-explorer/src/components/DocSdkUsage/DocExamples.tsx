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
import { Link } from '@looker/components'
import { IFileCall } from '@looker/sdk-codegen-scripts/lib/miner'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const index = require('../../../../../examples/motherlode.json').nuggets

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
    default:
      return ''
  }
}

interface IExample extends IFileCall {}

/**
 * Searches for examples containing operationId usages in the given language
 * @param language Language example should be in
 * @param operationId Method's operationId to search for
 */
const findExamples = (language: string, operationId: string): IExample[] => {
  const allMethodExamples = index[operationId]
  const ext = getLanguageExtension(language)
  let matches

  if (allMethodExamples && ext) {
    matches = allMethodExamples.calls[ext]
  }

  return matches
}

// TODO: asynchronously fetch index at first render. Report if not available in this component
// TODO: Replace link href with full github link to source file
// TODO: Replace link text to example summary
/**
 * Renders links to source files referencing the operationId in the given language
 */
export const DocExamples: FC<DocExamplesProps> = ({
  language,
  operationId,
}) => {
  const examples = findExamples(language, operationId)

  return (
    <>
      {examples &&
        examples.length > 0 &&
        examples.map((example, index) => (
          <li key={index}>
            <Link href={example.sourceFile}>{example.sourceFile}</Link>
          </li>
        ))}
    </>
  )
}
