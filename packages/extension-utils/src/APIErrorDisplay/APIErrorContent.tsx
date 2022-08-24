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

import React, { useCallback, useEffect, useState } from 'react'
import { ErrorDoc } from '@looker/sdk-rtl'
import { getEnvAdaptor } from '../adaptorUtils'
import { ExtMarkdown } from '../ExtMarkdown'
import { APIErrorDetails } from './APIErrorDetails'
import { APIErrorDocLink } from './APIErrorDocLink'
import type { APIErrorDisplayProps } from './APIErrorDisplay'
import { apiErrorDisplayFetch } from './utils'

/**
 * Shows available content of an API Error response
 * @param error to display
 * @param showDoc true to retrieve the corresponding error markdown
 */
export const APIErrorContent = ({ error, showDoc }: APIErrorDisplayProps) => {
  const [doc, setDoc] = useState<string>('')
  const getDoc = useCallback(
    async (docUrl: string) => {
      const adaptor = getEnvAdaptor()
      const errDoc = new ErrorDoc(adaptor.sdk, apiErrorDisplayFetch)
      setDoc(await errDoc.content(docUrl))
    },
    [error]
  )

  useEffect(() => {
    if (showDoc && error && error.documentation_url) {
      getDoc(error.documentation_url)
    }
  }, [error, showDoc])

  return (
    <>
      <APIErrorDetails error={error} />
      {!showDoc && <APIErrorDocLink docUrl={error.documentation_url ?? ''} />}
      {showDoc && doc && <ExtMarkdown source={doc} />}
    </>
  )
}
