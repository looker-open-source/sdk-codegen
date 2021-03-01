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

import React, { FC, useState } from 'react'
import { ApiModel, DiffRow } from '@looker/sdk-codegen'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { SelectMulti, Select, Space, SpaceVertical } from '@looker/components'
import { SpecItems } from '../../ApiExplorer'
import { getDefaultSpecKey } from '../../reducers/spec/utils'
import { diffPath } from '../../utils'
import { allDiffToggles, compareApis } from './compareUtils'
import { DocDiff } from './DocDiff'

export interface CompareSceneProps {
  specs: SpecItems
}

// interface CompareSceneSpecProps {
//   /** Left spec parameter */
//   l: string
//   /** Right spec parameter */
//   r: string
// }

/**
 * Pick the left key, or default spec
 * @param specs to pick from
 * @param leftKey spec key that may or may not have a value
 */
const pickLeft = (specs: SpecItems, leftKey: string) => {
  if (leftKey) return leftKey
  return getDefaultSpecKey(specs)
}

/**
 * Pick the right key, or "other" spec
 * @param specs to pick from
 * @param rightKey spec key from url path
 * @param leftKey spec key from url path
 */
const pickRight = (specs: SpecItems, rightKey: string, leftKey: string) => {
  if (rightKey) return rightKey
  if (!leftKey) leftKey = getDefaultSpecKey(specs)
  return Object.keys(specs).find((k) => k !== leftKey) || ''
}

const diffToggles = [
  {
    label: 'Missing',
    value: 'missing',
  },
  {
    label: 'Status',
    value: 'status',
  },
  {
    label: 'Parameters',
    value: 'params',
  },
  {
    label: 'Type',
    value: 'type',
  },
  {
    label: 'Body',
    value: 'body',
  },
  {
    label: 'Responses',
    value: 'response',
  },
]

export const CompareScene: FC<CompareSceneProps> = ({ specs }) => {
  const history = useHistory()
  const match = useRouteMatch<{ l: string; r: string }>(`/${diffPath}/:l?/:r?`)
  const l = match?.params.l || ''
  const r = match?.params.r || ''
  const options = Object.entries(specs).map(([key, spec]) => ({
    value: key,
    label: `${key} (${spec.status})`,
  }))

  const [leftKey, setLeftKey] = useState<string>(pickLeft(specs, l))
  const [rightKey, setRightKey] = useState<string>(pickRight(specs, r, leftKey))
  const [leftApi, setLeftApi] = useState<ApiModel>(specs[leftKey].api!)
  const [rightApi, setRightApi] = useState<ApiModel>(
    rightKey ? specs[rightKey].api! : specs[leftKey].api!
  )
  const [toggles, setToggles] = useState(allDiffToggles)

  const computeDelta = (left: string, right: string) => {
    if (left && right) {
      return compareApis(specs[left].api!, specs[right].api!, toggles)
    }
    return []
  }
  const [delta, setDelta] = useState<DiffRow[]>(computeDelta(leftKey, rightKey))

  const compareKeys = (left: string, right: string) => {
    setLeftKey(left)
    setLeftApi(specs[left].api!)
    setRightKey(right)
    setRightApi(specs[right].api!)
    setDelta(computeDelta(left, right))
    history.push(`/${diffPath}/${left}/${right}`)
  }

  const handleLeftChange = (newLeft: string) => {
    compareKeys(newLeft, rightKey)
  }

  const handleTogglesChange = (values?: string[]) => {
    setToggles(values || [])
    setDelta(computeDelta(leftKey, rightKey))
  }

  const handleRightChange = (newRight: string) => {
    compareKeys(leftKey, newRight)
  }

  return (
    <>
      <SpaceVertical>
        <Space between>
          <Select
            name="Left Version"
            defaultValue={leftKey}
            options={options}
            onChange={handleLeftChange}
          />
          <SelectMulti
            name="toggles"
            placeholder="Comparison options"
            defaultValues={allDiffToggles}
            onChange={handleTogglesChange}
            options={diffToggles}
          />
          <Select
            name="Right Version"
            defaultValue={rightKey}
            options={options}
            onChange={handleRightChange}
          />
        </Space>
        <Space>
          <DocDiff delta={delta} leftSpec={leftApi} rightSpec={rightApi} />
        </Space>
      </SpaceVertical>
    </>
  )
}
