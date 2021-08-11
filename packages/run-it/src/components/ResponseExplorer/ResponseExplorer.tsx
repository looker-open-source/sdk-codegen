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
import { CodeDisplay } from '@looker/code-editor'
import { Heading } from '@looker/components'
import type { ResponseContent } from '../..'
import { ShowResponse, Collapser } from '../..'

interface ResponseExplorerProps {
  response: ResponseContent
  verb: string
  path: string
}

const getHeaders = (response: ResponseContent): string[][] => {
  const result: string[][] = response?.headers
    ? Object.entries(response?.headers).map(([key, val]) => [key, val])
    : []
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
export const ResponseExplorer: FC<ResponseExplorerProps> = ({
  response,
  verb,
  path,
}) => {
  const [headers, setHeaders] = useState(getHeaders(response))
  const [bodySize, setBodySize] = useState(getBodySize(response))
  useEffect(() => {
    setHeaders(getHeaders(response))
    setBodySize(getBodySize(response))
  }, [response])
  if (!response) {
    return <></>
  }
  // TODO make a badge for the verb.
  // Once we are satisfied with the badge in the api-explorer package it should be moved here

  return (
    <>
      <Heading as="h4">{`${verb || ''} ${path || ''} ${response.statusCode}: ${
        response.contentType
      }`}</Heading>

      {headers.length > 0 && (
        <Collapser key="headers" heading="Headers" id="headers">
          <CodeDisplay language="json" code={JSON.stringify(headers)} />
        </Collapser>
      )}
      <Collapser heading={`Body (${bodySize})`} id="body">
        <ShowResponse response={response} />
      </Collapser>
    </>
  )
}
