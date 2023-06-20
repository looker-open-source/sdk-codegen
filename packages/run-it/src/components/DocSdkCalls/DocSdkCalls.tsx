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

import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import type { ApiModel, IMethod } from '@looker/sdk-codegen'
import { getCodeGenerator, trimInputs } from '@looker/sdk-codegen'
import { Heading } from '@looker/components'
import { CodeCopy } from '@looker/code-editor'

import type { RunItValues } from '../../RunIt'
import { DarkSpan } from '../common'
import { DocMultiCall } from './DocMultiCall'
import { getGenerators } from './callUtils'

export interface DocSdkCallsProps {
  /** API spec */
  api: ApiModel
  /** current method */
  method: IMethod
  /** Entered RunIt form values */
  inputs: RunItValues
  /** Language to generate Sdk calls in*/
  sdkLanguage: string
  /** true to not trim the body params */
  keepBody?: boolean
}

/**
 * Generates the SDK call syntax for a given language or all supported languages
 */
export const DocSdkCalls: FC<DocSdkCallsProps> = ({
  api,
  method,
  inputs,
  sdkLanguage = 'All',
  keepBody = false,
}) => {
  const [heading, setHeading] = useState('')
  const trimmed = trimInputs(inputs, keepBody)

  useEffect(() => {
    const text =
      sdkLanguage === 'All'
        ? 'SDKs call syntax'
        : `${sdkLanguage} SDK call syntax`
    setHeading(text)
  }, [sdkLanguage])

  const calls = {}
  try {
    if (sdkLanguage === 'All') {
      const generators = getGenerators(api)
      Object.entries(generators).forEach(([language, gen]) => {
        calls[language] = gen.makeTheCall(method, trimmed)
      })
    } else {
      const gen = getCodeGenerator(sdkLanguage, api)
      calls[sdkLanguage] = gen!.makeTheCall(method, trimmed)
    }
  } catch {
    return (
      <DarkSpan>
        Cannot generate SDK call syntax. Ensure all complex structures in the
        request form are valid.
      </DarkSpan>
    )
  }

  return (
    <>
      <Heading as="h4" mb="medium">
        {heading}
      </Heading>
      {sdkLanguage === 'All' ? (
        <DocMultiCall calls={calls} />
      ) : (
        <CodeCopy code={calls[sdkLanguage]} language={sdkLanguage} />
      )}
    </>
  )
}
