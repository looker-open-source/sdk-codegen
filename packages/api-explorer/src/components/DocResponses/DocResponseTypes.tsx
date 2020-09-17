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

import React, { FC, useEffect, useState } from 'react'
import { ButtonToggle, ButtonItem } from '@looker/components'
import { KeyedCollection, IMethodResponse } from '@looker/sdk-codegen'

import { DocCode } from '../DocCode'
import { copyAndCleanResponse } from './utils'

interface DocResponseTypesProps {
  responses: KeyedCollection<IMethodResponse>
}

/**
 * Temporary handler for state change lag when switching from an endpoint that is missing the first mediaType
 * from the last endpoint
 *
 * @param responses all method responses
 * @param mediaType missing media type (which shows the state lag
 */
const responseNotFound = (
  responses: KeyedCollection<IMethodResponse>,
  mediaType: string
) => {
  const types = Object.keys(responses)
  const notFound = `Response mediaType ${mediaType} not found. Available types are: ${types.join(
    ', '
  )}`
  return <span>{notFound}</span>
}

/**
 * Given a collection of media types (keys) and responses (values) for a response code, generate a group of buttons for
 * toggling media type and render the response
 * @param response
 */
export const DocResponseTypes: FC<DocResponseTypesProps> = ({ responses }) => {
  const [mediaTypes, setMediaTypes] = useState(Object.keys(responses))
  const [mediaType, setMediaType] = useState(mediaTypes[0])

  useEffect(() => {
    const keys = Object.keys(responses)
    setMediaTypes(Object.keys(responses))
    setMediaType(keys.length > 0 ? keys[0] : '')
  }, [responses])

  return (
    <>
      <ButtonToggle
        value={mediaType}
        onChange={setMediaType}
        mt="large"
        mb="large"
      >
        {mediaTypes.map((mediaType) => (
          <ButtonItem key={mediaType}>{mediaType}</ButtonItem>
        ))}
      </ButtonToggle>
      {responses[mediaType] && (
        <DocCode
          code={JSON.stringify(
            copyAndCleanResponse(responses[mediaType]),
            null,
            2
          )}
        />
      )}
      {!responses[mediaType] && responseNotFound(responses, mediaType)}
    </>
  )
}
