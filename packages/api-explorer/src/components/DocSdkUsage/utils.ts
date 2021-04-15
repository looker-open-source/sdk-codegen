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
import { findExamples, IExampleMine } from '@looker/sdk-codegen'

/**
 * Gets the line number from the end of a Github permalink
 * @param link - github permalink
 * @returns A stringified line number of the link
 */
export function getLineNumberFromLink(link: string): string {
  return link.split('#L')[1]
}

/**
 * Gets the filename from the end of a path
 * @param path - repository path
 * @returns file name
 */
export function getFileNameFromPath(path: string): string {
  const lastForwardSlash = path.lastIndexOf('/')
  return lastForwardSlash === -1 ? path : path.slice(lastForwardSlash + 1)
}

export interface ExampleLinkTableRow {
  filename: string
  language: string
  line: string
  permalink: string
}

/**
 * Formats the examples for each language into a format that is displayable in a table structure
 * @param languages - languages to example mine
 * @param examples - the mined examples
 * @param operationId - the current operation id
 * @returns display-ready table data
 */
export function prepareExampleTableData(
  languages: string[],
  examples: IExampleMine,
  operationId: string
): ExampleLinkTableRow[] {
  return languages.reduce(function (result: ExampleLinkTableRow[], language) {
    const languageExamples = findExamples(examples, language, operationId)
    return [
      ...result,
      ...languageExamples.map((exampleLink) => {
        return {
          filename: getFileNameFromPath(exampleLink.description),
          line: getLineNumberFromLink(exampleLink.permalink),
          language: language,
          permalink: exampleLink.permalink,
        }
      }),
    ]
  }, [])
}
