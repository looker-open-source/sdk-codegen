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

import React, { FC, useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableDataCell,
  Heading,
  Span,
  TableHead,
  TableHeaderCell,
} from '@looker/components'
import styled from 'styled-components'
import { CollapserCard, ResponseContent, ShowResponse } from '../..'

type HeaderTable = string[][]
const getHeaders = (response: ResponseContent): HeaderTable => {
  if (!response?.headers) return []
  const result: HeaderTable = []
  Object.entries(response.headers).forEach(([key, val]) =>
    result.push([key, val])
  )
  return result
}

const getBodySize = (response: ResponseContent): string => {
  const size =
    !response || !response.body
      ? 0
      : response?.body instanceof Blob
      ? response?.body.size
      : response?.body.toString().length

  return `${size} bytes`
}

export const NoWrap = styled(Span)`
  display: inline-block;
  direction: rtl;
  white-space: nowrap;
  overflow: hidden;
`

interface ShowHeadersProps {
  response: ResponseContent
}

export const ResponseHeaders: FC<ShowHeadersProps> = ({ response }) => {
  const rows = getHeaders(response)
  if (rows.length === 0) return <></>
  return (
    <CollapserCard
      key="headers"
      heading={`Headers (${rows.length})`}
      id="headers"
      defaultOpen={false}
      divider={false}
    >
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell p="xsmall">Name</TableHeaderCell>
              <TableHeaderCell p="xsmall">Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([key, value]) => (
              <TableRow key={key}>
                <TableDataCell p="xsmall">
                  <NoWrap>
                    <strong>{key}</strong>
                  </NoWrap>
                </TableDataCell>
                <TableDataCell p="xsmall">
                  <Span>{value}</Span>
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    </CollapserCard>
  )
}

interface ResponseExplorerProps {
  response: ResponseContent
  verb: string
  path: string
}

export const ResponseExplorer: FC<ResponseExplorerProps> = ({
  response,
  verb,
  path,
}) => {
  const [bodySize, setBodySize] = useState(getBodySize(response))
  useEffect(() => {
    setBodySize(getBodySize(response))
  }, [response])
  // TODO make a badge for the verb.
  // Once we are satisfied with the badge in the api-explorer package it should be moved here

  return (
    <>
      {response && (
        <>
          <Heading as="h4">
            {`${verb || ''} ${path || ''} (${response.statusCode}: ${
              response.statusMessage
            })`}
          </Heading>
          <CollapserCard
            divider={false}
            heading={`Body (${bodySize})`}
            id="body"
          >
            <ShowResponse response={response} />
          </CollapserCard>
          <ResponseHeaders response={response} />
        </>
      )}
      {!response && (
        <>
          <Span>No response was received</Span>
        </>
      )}
    </>
  )
}
