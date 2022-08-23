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
import { ErrorDoc } from '@looker/sdk-rtl'
import { getEnvAdaptor } from '../adaptorUtils'
import { ExtMarkdown } from '../ExtMarkdown'
import type { APIErrorDisplayProps } from '.'
import { APIErrorDetails, apiErrorDisplayFetch, APIErrorDocLink } from '.'

/**
 * Shows available content of an API Error response
 * @param error to display
 * @param showDoc true to retrieve the corresponding error markdown
 * @constructor
 */
export const APIErrorContent: FC<APIErrorDisplayProps> = ({
  error,
  showDoc,
}) => {
  const [doc, setDoc] = useState<string>('')
  const getDoc = async (docUrl: string) => {
    const adaptor = getEnvAdaptor()
    const errDoc = new ErrorDoc(adaptor.sdk, apiErrorDisplayFetch)
    setDoc(await errDoc.content(docUrl))
  }
  useEffect(() => {
    if (showDoc && error && error.documentation_url) {
      getDoc(error.documentation_url)
    }
  }, [error, showDoc])

  return (
    <>
      <APIErrorDetails error={error} />
      {!showDoc && APIErrorDocLink(error.documentation_url ?? '')}
      {showDoc && doc && <ExtMarkdown source={doc} />}
    </>
  )
}
