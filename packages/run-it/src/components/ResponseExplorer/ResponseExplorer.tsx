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
import type { ResponseContent } from '../..'
import { ShowResponse, Collapser } from '../..'

type HeaderTable = string[][]
const getHeaders = (response: ResponseContent): HeaderTable => {
  if (!response?.headers) return []
  const result: HeaderTable = [['Name', 'Value']]
  Object.entries(response.headers).forEach(([key, val]) =>
    result.push([key, val])
  )
  return result
}

const getBodySize = (response: ResponseContent): string => {
  const result = `${
    response?.body instanceof Blob
      ? response?.body.size
      : response?.body.toString().length
  } bytes`
  return result
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

const ShowHeaders: FC<ShowHeadersProps> = ({ response }) => {
  const data = getHeaders(response)
  if (data.length === 0) return <></>
  const rows = data.slice(1)
  return (
    <Collapser
      key="headers"
      heading={`Headers (${rows.length})`}
      id="headers"
      defaultOpen={false}
    >
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
    </Collapser>
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
  if (!response) {
    return <></>
  }
  // TODO make a badge for the verb.
  // Once we are satisfied with the badge in the api-explorer package it should be moved here

  return (
    <>
      <Heading as="h4">{`${verb || ''} ${path || ''} (${response.statusCode}: ${
        response.statusMessage
      })`}</Heading>
      <Collapser heading={`Body (${bodySize})`} id="body">
        <ShowResponse response={response} />
      </Collapser>
      <ShowHeaders response={response} />
    </>
  )
}
