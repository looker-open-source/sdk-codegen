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
import { Heading, SpaceVertical } from '@looker/components'
import { APIErrorContent } from './APIErrorContent'
import { errorHeading } from './utils'

export interface APIErrorDisplayProps {
  /** Populated SDK error information, which may contain detailed errors */
  error: LookerSDKError
  /** true to retrieve the markdown error document from the CDN and display it instead of a link */
  showDoc?: boolean
}

/**
 * Show API error information in the parent React component
 * @param error to display
 * @param showDoc true to fetch the error document markdown. false for a clickable link
 */
export const APIErrorDisplay: FC<APIErrorDisplayProps> = ({
  error,
  showDoc = false,
}) => {
  return (
    <>
      {error && (
        <SpaceVertical>
          <Heading type="h2">{errorHeading(error)}</Heading>
          <APIErrorContent error={error} showDoc={showDoc} />
        </SpaceVertical>
      )}
    </>
  )
}
