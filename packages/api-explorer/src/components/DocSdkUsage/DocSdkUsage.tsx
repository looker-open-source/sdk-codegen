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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  DataTable,
  DataTableItem,
  Icon,
  Link,
  Space,
  Pagination,
} from '@looker/components';
import type { IMethod } from '@looker/sdk-codegen';
import { findExampleLanguages } from '@looker/sdk-codegen';
import { CollapserCard } from '@looker/run-it';
import { InsertDriveFile } from '@styled-icons/material-outlined/InsertDriveFile';
import { useSelector } from 'react-redux';

import { selectSdkLanguage, selectExamplesLode } from '../../state';
import {
  exampleColumns,
  EMPTY_STRING,
  prepareExampleDataTable,
  PER_PAGE_COUNT,
  sortLanguagesByPreference,
} from './utils';
import { DocSdkExampleCell } from './DocSdkExampleCell';

interface DocSdkUsageProps {
  method: IMethod;
}

/**
 *  Given an SDK method, searches the examples index for its usages in various languages and renders
 *  links to the source files
 */
export const DocSdkUsage: FC<DocSdkUsageProps> = ({ method }) => {
  const examples = useSelector(selectExamplesLode);
  const sdkLanguage = useSelector(selectSdkLanguage);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [method]);

  if (!examples) return <></>;
  let languages = findExampleLanguages(examples, method.name);
  if (languages.length === 0) return <></>;

  languages = sortLanguagesByPreference(languages, sdkLanguage);

  const { pageExamples, pageLimit, paginate } = prepareExampleDataTable(
    languages,
    examples,
    method.operationId,
    page
  );

  if (pageExamples.length === 0) return <></>;

  return (
    <CollapserCard id="examples" heading="SDK Examples">
      <Card height="auto" px="small" py="xsmall" mt="small">
        <DataTable caption="SDK Examples" columns={exampleColumns}>
          {pageExamples.map((exampleRow, i) => {
            const isEmptyItem = exampleRow.filename === EMPTY_STRING;
            const isLastItem =
              (i + 1) % PER_PAGE_COUNT === 0 || i + 1 === pageExamples.length;
            const nextItemEmpty =
              pageExamples[i + 1]?.filename === EMPTY_STRING;
            const hidden = isEmptyItem || isLastItem || nextItemEmpty;
            return (
              <DataTableItem
                id={exampleRow.permalink}
                key={exampleRow.permalink}
              >
                <DocSdkExampleCell hideBorderBottom={hidden}>
                  <Space gap="xsmall">
                    {!isEmptyItem && (
                      <Icon
                        icon={<InsertDriveFile />}
                        color="text1"
                        size="small"
                      />
                    )}
                    <Link
                      href={exampleRow.permalink}
                      target={'_blank'}
                      role="link"
                    >
                      {exampleRow.filename}
                    </Link>
                  </Space>
                </DocSdkExampleCell>
                <DocSdkExampleCell hideBorderBottom={hidden}>
                  {exampleRow.language}
                </DocSdkExampleCell>
                <DocSdkExampleCell hideBorderBottom={hidden}>
                  {exampleRow.description}
                </DocSdkExampleCell>
                <DocSdkExampleCell hideBorderBottom={hidden}>
                  {exampleRow.line}
                </DocSdkExampleCell>
              </DataTableItem>
            );
          })}
        </DataTable>
        {paginate && (
          <Box alignSelf="center">
            <Pagination
              current={page}
              pages={pageLimit}
              onChange={(nextPage) => {
                setPage(nextPage);
              }}
            />
          </Box>
        )}
      </Card>
    </CollapserCard>
  );
};
