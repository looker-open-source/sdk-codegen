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
import React, { useEffect, useState } from 'react'
import type { IAPIMethods, LookerSDKError } from '@looker/sdk-rtl'
import {
  Heading,
  Link,
  Span,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  SpaceVertical,
} from '@looker/components'
import { ErrorDoc } from '@looker/sdk-rtl'
import { getEnvAdaptor } from './adaptorUtils'
import { ExtMarkdown } from './ExtMarkdown'

export interface APIErrorDisplayProps {
  /** Populated SDK error information, which may contain detailed errors */
  error: LookerSDKError
  /** true to retrieve the markdown error document from the CDN and display it instead of a link */
  showDoc?: boolean
}

export const standardDocLink = (docUrl?: string | null) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const adaptor = getEnvAdaptor()
    adaptor.openBrowserWindow(e.currentTarget.href)
  }

  if (!docUrl) return <></>
  return (
    <Link href={docUrl} key={docUrl} onClick={onClick}>
      More information
    </Link>
  )
}

interface DetailedErrorProps {
  error: LookerSDKError
}

/**
 * Shows the detailed API errors table
 *
 * Because documentation_url is currently identical with the main documentation_url
 * it is not included in the table
 *
 * @param error to display
 * @constructor
 */
export const DetailedErrors: FC<DetailedErrorProps> = ({ error }) => {
  if (!error?.errors) return null

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

const fetcher = async (_sdk: IAPIMethods, url: string) => {
  let result = await (await fetch(url)).text()
  const stop = result.indexOf('## API Response Type')
  if (stop > 0) {
    result = result.substring(0, stop - 1).trim()
  }
  return result
}

export const APIErrorDisplay: FC<APIErrorDisplayProps> = ({
  error,
  showDoc = false,
}) => {
  const [doc, setDoc] = useState<string>('')
  const getDoc = async (docUrl: string) => {
    const adaptor = getEnvAdaptor()
    const errDoc = new ErrorDoc(adaptor.sdk, fetcher)
    setDoc(await errDoc.content(docUrl))
  }
  useEffect(() => {
    if (showDoc && error && error.documentation_url) {
      getDoc(error.documentation_url)
    }
    // return () => unregisterEnvAdaptor()
  }, [error, showDoc])
  return (
    <>
      {error && (
        <SpaceVertical margin="8px">
          <Heading type="h2">{error.message || 'Unknown error'}</Heading>
          <DetailedErrors error={error} />
          {!showDoc && standardDocLink(error.documentation_url ?? '')}
          {showDoc && doc && <ExtMarkdown source={doc} />}
        </SpaceVertical>
      )}
    </>
  )
}
