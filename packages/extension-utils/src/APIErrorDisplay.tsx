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

import type { FC } from 'react'
import React from 'react'
import type { LookerSDKError } from '@looker/sdk-rtl'
import {
  Heading,
  Space,
  Link,
  Span,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@looker/components'
import { getEnvAdaptor } from './adaptorUtils'

interface DetailedErrorsProps {
  error: LookerSDKError
}

export const DetailedErrors: FC<DetailedErrorsProps> = ({ error }) => {
  if (!error?.errors) return null
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const adaptor = getEnvAdaptor()
    adaptor.openBrowserWindow(e.currentTarget.href)
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell p="xsmall">Field</TableHeaderCell>
          <TableHeaderCell p="xsmall">Code</TableHeaderCell>
          <TableHeaderCell p="xsmall">Message</TableHeaderCell>
          <TableHeaderCell p="xsmall">Documentation URL</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {error.errors.map(({ field, code, message, documentation_url }) => (
          <TableRow key={field}>
            <TableDataCell p="xsmall">{field}</TableDataCell>
            <TableDataCell p="xsmall">{code}</TableDataCell>
            <TableDataCell p="xsmall">
              <Span>{message}</Span>
            </TableDataCell>
            <TableDataCell p="xsmall">
              <Link
                href={documentation_url!}
                key={`${field}_link`}
                onClick={onClick}
              >
                {documentation_url}
              </Link>
            </TableDataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const docLinkHandler = (docUrl?: string | null) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const adaptor = getEnvAdaptor()
    adaptor.openBrowserWindow(e.currentTarget.href)
  }

  if (!docUrl) return null
  return (
    <Link href={docUrl} key={docUrl} onClick={onClick}>
      {docUrl}
    </Link>
  )
}

interface ErrorDisplayProps {
  /** Populated SDK error information, which may contain detailed errors */
  error: LookerSDKError
  /** callback function to show documentation url, or content derived from the documentation url */
  showDoc?: (url?: string) => Element
}

export const APIErrorDisplay: FC<ErrorDisplayProps> = ({
  error,
  showDoc = docLinkHandler,
}) => {
  return (
    <>
      {error && (
        <Space between>
          <Heading type="h2">{error.message || 'Unknown error'}</Heading>
          <DetailedErrors error={error} />
          {showDoc(error.documentation_url ?? '')}
        </Space>
      )}
    </>
  )
}
