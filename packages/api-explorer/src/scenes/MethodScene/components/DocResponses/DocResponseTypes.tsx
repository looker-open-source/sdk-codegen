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

import React, { useState, useEffect } from 'react'
import { ButtonToggle, ButtonItem } from '@looker/components'
import type {
  ApiModel,
  KeyedCollection,
  IMethodResponse,
} from '@looker/sdk-codegen'

import { ExploreType } from '../../../../components'

interface DocResponseTypesProps {
  api: ApiModel
  /** responses to render */
  responses: KeyedCollection<IMethodResponse>
}

/**
 * Given a collection of media types (keys) and responses (values) for a response code, generate a group of buttons for
 * toggling media type and render the response
 * @param response
 */
export const DocResponseTypes = ({ api, responses }: DocResponseTypesProps) => {
  const mediaTypes = Object.keys(responses)
  const [selectedMediaType, setSelectedMediaType] = useState(mediaTypes[0])
  const [resps, setResps] = useState(responses)

  useEffect(() => {
    /** When new responses are passed, update the default selected media type */
    setSelectedMediaType(mediaTypes[0])
    setResps(responses)
  }, [responses, mediaTypes])

  // TODO: Account for endpoints with no responses (e.g. delete a custom cmd)
  return (
    <>
      <ButtonToggle
        value={selectedMediaType}
        onChange={setSelectedMediaType}
        mt="large"
        mb="large"
      >
        {mediaTypes.map((mediaType) => (
          <ButtonItem key={mediaType}>{mediaType}</ButtonItem>
        ))}
      </ButtonToggle>
      <div style={{ overflow: 'auto' }}>
        <ExploreType
          api={api}
          key={selectedMediaType}
          type={resps[selectedMediaType].type}
          link={true}
          maxDepth={2}
        />
      </div>
    </>
  )
}
