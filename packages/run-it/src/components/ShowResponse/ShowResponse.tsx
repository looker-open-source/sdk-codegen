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
import { Heading } from '@looker/components'
import { IRawResponse } from '@looker/sdk-rtl/lib/browser'

import { pickResponseHandler } from './responseUtils'

interface ShowResponseProps {
  /** A basic HTTP response for "raw" HTTP requests */
  response: IRawResponse
  /** HTTP Method */
  verb?: string
  /** HTTP request path */
  path?: string
}

/**
 * Given an HTTP response it picks a response handler based on the content type and renders the body
 */
export const ShowResponse: FC<ShowResponseProps> = ({
  response,
  verb,
  path,
}) => {
  const pickedHandler = pickResponseHandler(response)

  // TODO make a badge for the verb.
  // Once we are satisfied with the badge in the api-explorer package it should be moved here
  return (
    <>
      <Heading as="h4">{`${verb || ''} ${path || ''} ${response.statusCode}: ${
        response.contentType
      }`}</Heading>
      {pickedHandler && pickedHandler.component(response)}
    </>
  )
}
