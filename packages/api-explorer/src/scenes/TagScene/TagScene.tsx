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
import { useParams, NavLink } from 'react-router-dom'
import { ButtonGroup, ButtonTransparent, Grid } from '@looker/components'

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
  const tag = Object.values(api.schema?.tags!).filter(
    (tag) => tag.name === methodTag
  )[0]
  const methods = api.tags[tag.name]
  const operations = getOperations(methods)
  const allOptions = operations.map((op) => op.value)
  const [value, setValue] = useState<string[]>(operations.map((el) => el.value))

  return (
    <>
      <DocTitle title={`${tag.name}: ${tag.description}`} />
      <ButtonTransparent
        disabled={value.length === allOptions.length}
        className="active"
        onClick={() => setValue(allOptions)}
      >
        ALL
      </ButtonTransparent>
      <ButtonGroup
        value={value}
        onChange={setValue}
        padding="xsmall"
        options={operations}
      />
      {Object.values(methods).map(
        (method, index) =>
          value.includes(method.httpMethod) && (
            <NavLink
              key={index}
              to={buildMethodPath(specKey, tag.name, method.name)}
            >
              <Grid columns={1} padding="xsmall">
                <DocMethodSummary key={index} method={method} />
              </Grid>
            </NavLink>
          )
      )}
    </>
  )
}
