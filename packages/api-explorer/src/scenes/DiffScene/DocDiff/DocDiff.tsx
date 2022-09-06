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
import type { ApiModel, DiffRow } from '@looker/sdk-codegen'
import {
  Flex,
  Heading,
  Pagination,
  Space,
  SpaceVertical,
  Text,
} from '@looker/components'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import isEqual from 'lodash/isEqual'
import {
  selectDiffMethod,
  selectDiffOptions,
  useSettingActions,
} from '../../../state'
import { useNavigation } from '../../../utils'
import { getValidDiffOptions, getValidDiffMethods } from '../diffUtils'
import { DiffItem } from './DiffItem'
import { getPageNumber } from './docDiffUtils'

export interface DocDiffProps {
  /** Using delta because IntelliJ has bugs with 'diff' in a react app */
  delta: DiffRow[]
  /** Left side specKey */
  leftKey: string
  /** Left side spec */
  leftSpec: ApiModel
  /** Right side specKey */
  rightKey: string
  /** Right side spec */
  rightSpec: ApiModel
  /** Number of rows per page. Defaults to 15 */
  pageSize?: number
}

export const DocDiff: FC<DocDiffProps> = ({
  delta,
  leftKey,
  leftSpec,
  rightKey,
  rightSpec,
  pageSize = 15,
}) => {
  const selectedDiffMethod = useSelector(selectDiffMethod)
  const selectedDiffOptions = useSelector(selectDiffOptions)
  const { navigate } = useNavigation()
  const [page, setPage] = useState(1)
  const { setDiffMethodAction } = useSettingActions()

  useEffect(() => {
    if (!(leftSpec && rightSpec)) return
    const pageNum = getPageNumber(selectedDiffMethod, pageSize, delta)
    if (pageNum === -1) {
      setPage(page <= pageCount ? page : 1)
    } else {
      setPage(pageNum)
    }
  }, [selectedDiffMethod, delta])

  useEffect(() => {
    if (!(leftSpec && rightSpec) || !delta.length) return
    const params = new URLSearchParams(location.search)
    const diffOptionsParam = getValidDiffOptions(params.get('opts'))
    // TODO: discuss how this ensures opts drives state first, then method param
    if (!isEqual(selectedDiffOptions, diffOptionsParam || [])) return
    // syncing diff method on diff scene page
    const diffMethodsParam = getValidDiffMethods(
      leftSpec,
      rightSpec,
      selectedDiffOptions,
      params.get('m')
    )
    // TODO: discuss better URL cleanup approaches other than doing it here
    if (!diffMethodsParam && params.get('m')) {
      navigate(location.pathname, { m: null })
    }
    setDiffMethodAction({
      diffMethod: diffMethodsParam ? diffMethodsParam[0] : '',
    })
  }, [location.search, delta])

  if (delta.length === 0) return <Text>{'No differences found'}</Text>

  // const pageCount = Math.round((delta.length - 1) / pageSize)
  const pageCount = Math.ceil(delta.length / pageSize)
  const pageItemData = delta.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      {delta.length === 0 ? (
        <Text>{'No differences found'}</Text>
      ) : (
        <Flex flexDirection="column" alignItems="center">
          <Space>
            <Heading as="h2">{`${delta.length} differences between ${leftKey} and ${rightKey}`}</Heading>
          </Space>
          <SpaceVertical mt="large" gap="xxsmall">
            {pageItemData.map((item, index) => (
              <DiffItem
                key={`name-${item.name} item-${index}`}
                item={item}
                leftKey={leftKey}
                leftSpec={leftSpec}
                rightKey={rightKey}
                rightSpec={rightSpec}
              />
            ))}
          </SpaceVertical>
          <Pagination
            current={page}
            pages={pageCount}
            onChange={(nextPage) => {
              setPage(nextPage)
              const params = new URLSearchParams(location.search)
              if (params.get('m')) {
                navigate(location.pathname, { m: null })
              }
            }}
          />
        </Flex>
      )}
    </>
  )
}
