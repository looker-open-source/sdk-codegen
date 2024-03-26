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

import type { IExampleMine } from '@looker/sdk-codegen';
import { findExamples } from '@looker/sdk-codegen';
import type { DataTableColumns } from '@looker/components';
import { theme } from '@looker/components';

export const PER_PAGE_COUNT = 10;

export const EMPTY_STRING = '';

export const exampleColumns: DataTableColumns = [
  {
    id: 'filename',
    title: 'Filename',
    type: 'string',
    size: 30,
  },
  {
    id: 'language',
    title: 'Language',
    type: 'string',
    size: 20,
  },
  {
    id: 'description',
    title: 'Description',
    type: 'string',
    size: 40,
  },
  {
    id: 'line',
    title: 'Line',
    type: 'number',
    size: 20,
  },
];

export interface ExampleLinkTableRow {
  filename: string;
  language: string;
  line: string;
  permalink: string;
  description: string;
}

export interface DataTablePage {
  /** array of sdk examples for a given page */
  pageExamples: ExampleLinkTableRow[];
  /** the page limit of the larger example set */
  pageLimit: number;
  /** flag for whether or not to paginate results */
  paginate: boolean;
}

/**
 * Gets the filename from the end of a path
 * @param path - repository path
 * @returns file name
 */
export function getFileNameFromPath(path: string): string {
  const lastForwardSlash = path.lastIndexOf('/');
  return lastForwardSlash === -1
    ? path
    : path.slice(lastForwardSlash + 1, path.indexOf(' '));
}

/**
 * Formats the examples for each language into a format that is displayable in a table structure
 * @param languages - languages to example mine
 * @param examples - the mined examples
 * @param operationId - the current operation id
 * @param currentPage - the current page to paginate to
 * @returns display-ready table data
 */
export function prepareExampleDataTable(
  languages: string[],
  examples: IExampleMine,
  operationId: string,
  currentPage: number
): DataTablePage {
  const tableExamples = languages.reduce(function (
    result: ExampleLinkTableRow[],
    language: string
  ) {
    const languageExamples = findExamples(examples, language, operationId);
    return [
      ...result,
      ...languageExamples.map((exampleLink) => {
        return {
          filename: getFileNameFromPath(exampleLink.tooltip),
          line: exampleLink.lineNumber,
          language: language.toLowerCase(),
          permalink: exampleLink.permalink,
          description: exampleLink.description,
        };
      }),
    ];
  }, []);

  const pageExamples = tableExamples.filter(
    (example, index) =>
      example &&
      index + 1 > (currentPage - 1) * PER_PAGE_COUNT &&
      index + 1 <= currentPage * PER_PAGE_COUNT
  );

  const pageLimit = Math.ceil(tableExamples.length / PER_PAGE_COUNT);
  const paginate = tableExamples.length > PER_PAGE_COUNT;

  if (tableExamples.length > PER_PAGE_COUNT) {
    while (pageExamples.length !== PER_PAGE_COUNT) {
      pageExamples.push({
        filename: EMPTY_STRING,
        line: EMPTY_STRING,
        language: EMPTY_STRING,
        permalink: pageExamples.length.toString(),
        description: EMPTY_STRING,
      });
    }
  }
  return { pageExamples, pageLimit, paginate };
}

/**
 * returns a border-bottom style value for table items
 * @param hide whether or not to hide bottom border
 */
export function getTableItemBottomBorder(hide: boolean): string {
  return hide ? 'none' : `solid 1px ${theme.colors.ui2}`;
}

/**
 * puts preferred language examples at front of list
 * @param languages list of languages
 * @param sdkLanguage language preference
 */
export function sortLanguagesByPreference(
  languages: string[],
  sdkLanguage: string
): string[] {
  languages.some(
    (item, idx) =>
      item === sdkLanguage && languages.unshift(languages.splice(idx, 1)[0])
  );
  return languages;
}
