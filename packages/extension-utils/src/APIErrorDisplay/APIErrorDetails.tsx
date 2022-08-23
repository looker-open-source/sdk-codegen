/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import type { LookerSDKError } from '@looker/sdk-rtl'
import type { FC } from 'react'
import React from 'react'
import {
  Span,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@looker/components'

interface APIErrorDetailsProps {
  error: LookerSDKError
}

/**
 * Shows the detailed API errors table
 *
 * Because documentation_url is currently identical with the main documentation_url
 * it is not included in the table
 *
 * @param error to display
 */
export const APIErrorDetails: FC<APIErrorDetailsProps> = ({ error }) => {
  if (!error?.errors) return <></>

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell p="xsmall">Field</TableHeaderCell>
          <TableHeaderCell p="xsmall">Code</TableHeaderCell>
          <TableHeaderCell p="xsmall">Message</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {error.errors.map(({ field, code, message }, index) => (
          <TableRow key={`${field}${index}`}>
            <TableDataCell p="xsmall">{field}</TableDataCell>
            <TableDataCell p="xsmall">{code}</TableDataCell>
            <TableDataCell p="xsmall">
              <Span>{message}</Span>
            </TableDataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
