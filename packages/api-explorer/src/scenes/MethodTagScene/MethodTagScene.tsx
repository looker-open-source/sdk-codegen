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
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Grid, ButtonToggle, ButtonItem } from '@looker/components'
import type { ApiModel } from '@looker/sdk-codegen'
import { useSelector } from 'react-redux'
import { ApixSection, DocTitle, DocMethodSummary, Link } from '../../components'
import { buildMethodPath, useNavigation } from '../../utils'
import { getOperations } from './utils'
import { selectTagFilter } from '@looker/api-explorer'

interface MethodTagSceneProps {
  api: ApiModel
}

interface MethodTagSceneParams {
  specKey: string
  methodTag: string
}

export const MethodTagScene: FC<MethodTagSceneProps> = ({ api }) => {
  const { specKey, methodTag } = useParams<MethodTagSceneParams>()
  const history = useHistory()
  const navigate = useNavigation()
  const selectedTagFilter = useSelector(selectTagFilter)

  const setValue = (filter: string) => {
    navigate(location.pathname, { m: filter === 'ALL' ? null : filter })
  }

  useEffect(() => {
    /** Reset ButtonToggle value on route change */
    navigate(location.pathname, { m: null })
  }, [methodTag])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('m') && searchParams.get('m') !== selectedTagFilter) {
      navigate(location.pathname, {
        m: selectedTagFilter === 'ALL' ? null : selectedTagFilter,
      })
    }
  }, [selectedTagFilter])

  const methods = api.tags[methodTag]
  useEffect(() => {
    if (!methods) {
      navigate(`/${specKey}/methods`)
    }
  }, [history, methods])
  if (!methods) {
    return <></>
  }
  const tag = Object.values(api.spec.tags!).find(
    (tag) => tag.name === methodTag
  )!
  const operations = getOperations(methods)

  return (
    <ApixSection>
      <DocTitle>{`${tag.name}: ${tag.description}`}</DocTitle>
      <ButtonToggle
        mb="small"
        mt="xlarge"
        value={selectedTagFilter}
        onChange={setValue}
      >
        <ButtonItem key="ALL" px="large" py="xsmall">
          ALL
        </ButtonItem>
        {operations.map((op) => (
          <ButtonItem key={op} px="large" py="xsmall">
            {op}
          </ButtonItem>
        ))}
      </ButtonToggle>
      {Object.values(methods).map(
        (method, index) =>
          (selectedTagFilter === 'ALL' ||
            selectedTagFilter === method.httpMethod) && (
            <Link
              key={index}
              to={buildMethodPath(specKey, tag.name, method.name)}
            >
              <Grid columns={1} py="xsmall">
                <DocMethodSummary key={index} method={method} />
              </Grid>
            </Link>
          )
      )}
    </ApixSection>
  )
}
