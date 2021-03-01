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
import { DiffRow } from '@looker/sdk-codegen'
import { useHistory, useParams } from 'react-router-dom'
import { Select, Space, SpaceVertical } from '@looker/components'
import { SpecItems } from '../../ApiExplorer'
import { getDefaultSpecKey } from '../../reducers/spec/utils'
import { compareApis } from './compareUtils'
import { DocDiff } from './DocDiff'

export interface CompareSceneProps {
  specs: SpecItems
}

interface CompareSceneSpecProps {
  specKey: string
  rightSpec: string
}

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

export const CompareScene: FC<CompareSceneProps> = ({ specs }) => {
  const history = useHistory()
  const { specKey, rightSpec } = useParams<CompareSceneSpecProps>()
  const options = Object.entries(specs).map(([key, spec]) => ({
    value: key,
    label: `${key} (${spec.status})`,
  }))

  const [leftKey, setLeftKey] = useState<string>(pickLeft(specs, specKey))
  const [rightKey, setRightKey] = useState<string>(
    pickRight(specs, rightSpec, leftKey)
  )
  const computeDelta = (left: string, right: string) => {
    if (left && right) {
      return compareApis(specs[left].api!, specs[right].api!)
    }
    return []
  }
  const [delta, setDelta] = useState<DiffRow[]>(computeDelta(leftKey, rightKey))

  const compareKeys = (left: string, right: string) => {
    setLeftKey(left)
    setRightKey(right)
    setDelta(computeDelta(left, right))
    history.push(`compare/${left}/${right}`)
  }

  const handleLeftChange = (newLeft: string) => {
    compareKeys(newLeft, rightKey)
  }

  const handleRightChange = (newRight: string) => {
    compareKeys(leftKey, newRight)
  }

  return (
    <>
      <SpaceVertical>
        <Space>
          <Select
            name="Left Version"
            defaultValue={leftKey}
            options={options}
            onChange={handleLeftChange}
          />
          <Select
            name="Right Version"
            defaultValue={rightKey}
            options={options}
            onChange={handleRightChange}
          />
        </Space>
        <Space>
          <DocDiff delta={delta} pageSize={15} />
        </Space>
      </SpaceVertical>
    </>
  )
}
