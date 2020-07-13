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
import React, { FC, useState } from 'react'
import { ApiModel } from '@looker/sdk-codegen'
import { useParams, NavLink, useHistory } from 'react-router-dom'
import { Grid, ButtonToggle, ButtonItem } from '@looker/components'

import { DocTitle, DocMethodSummary } from '../../components'
import { buildMethodPath } from '../../utils'
import { getOperations } from './utils'

interface TagSceneProps {
  api: ApiModel
}

interface TagSceneParams {
  specKey: string
  methodTag: string
}
export const TagScene: FC<TagSceneProps> = ({ api }) => {
  const { specKey, methodTag } = useParams<TagSceneParams>()
  const history = useHistory()
  if (!(methodTag in api.tags)) {
    history.push('/methods')
  }
  const methods = api.tags[methodTag]
  const tag = Object.values(api.schema?.tags!).find(
    (tag) => tag.name === methodTag
  )!
  const operations = getOperations(methods)
  const [value, setValue] = useState('ALL')

  return (
    <>
      <DocTitle>{`${tag.name}: ${tag.description}`}</DocTitle>
      <ButtonToggle value={value} onChange={setValue}>
        <ButtonItem key="ALL" padding="xsmall">
          ALL
        </ButtonItem>
        {operations.map((op) => (
          <ButtonItem key={op} padding="xsmall">
            {op}
          </ButtonItem>
        ))}
      </ButtonToggle>
      {Object.values(methods).map(
        (method, index) =>
          (value === method.httpMethod || value === 'ALL') && (
            <NavLink
              key={index}
              to={buildMethodPath(specKey, tag.name, method.name)}
            >
              <Grid columns={1} py="xsmall">
                <DocMethodSummary key={index} method={method} />
              </Grid>
            </NavLink>
          )
      )}
    </>
  )
}
