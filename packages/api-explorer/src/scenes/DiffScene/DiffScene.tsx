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

import React, { FC, useState, useEffect } from 'react'
import { ApiModel, DiffRow, SpecList } from '@looker/sdk-codegen'
import { useHistory, useRouteMatch } from 'react-router-dom'
import {
  Box,
  Flex,
  FlexItem,
  IconButton,
  Label,
  Section,
  Select,
  SelectMulti,
} from '@looker/components'
import { getDefaultSpecKey } from '../../reducers/spec/utils'
import { diffPath } from '../../utils'
import { diffSpecs, standardDiffToggles } from './diffUtils'
import { DocDiff } from './DocDiff'

export interface DiffSceneProps {
  specs: SpecList
  toggleNavigation: (target?: boolean) => void
}

/**
 * Pick the left key, or default spec
 * @param specs to pick from
 * @param leftKey spec key that may or may not have a value
 */
const pickLeft = (specs: SpecList, leftKey: string) => {
  if (leftKey) return leftKey
  return getDefaultSpecKey(specs)
}

/**
 * Pick the right key, or "other" spec
 * @param specs to pick from
 * @param rightKey spec key from url path
 * @param leftKey spec key from url path
 */
const pickRight = (specs: SpecList, rightKey: string, leftKey: string) => {
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
    label: 'Response',
    value: 'response',
  },
]

export const DiffScene: FC<DiffSceneProps> = ({ specs, toggleNavigation }) => {
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
  const [toggles, setToggles] = useState<string[]>(standardDiffToggles)

  useEffect(() => {
    toggleNavigation(false)
  }, [])

  const computeDelta = (left: string, right: string, toggles: string[]) => {
    if (left && right) {
      return diffSpecs(specs[left].api!, specs[right].api!, toggles)
    }
    return []
  }
  const [delta, setDelta] = useState<DiffRow[]>(
    computeDelta(leftKey, rightKey, toggles)
  )

  const compareKeys = (left: string, right: string) => {
    if (left !== leftKey || right !== rightKey) {
      history.push(`/${diffPath}/${left}/${right}`)
    }
    setLeftApi(specs[left].api!)
    setRightApi(specs[right].api!)
    setDelta([...computeDelta(left, right, toggles)])
  }

  const handleLeftChange = (newLeft: string) => {
    setLeftKey(newLeft)
  }

  const handleTogglesChange = (values?: string[]) => {
    const newToggles = values || []
    setToggles(newToggles)
    setDelta([...computeDelta(leftKey, rightKey, newToggles)])
  }

  useEffect(() => {
    compareKeys(leftKey, rightKey)
  }, [leftKey, rightKey])

  const handleRightChange = (newRight: string) => {
    setRightKey(newRight)
  }

  const handleSwitch = () => {
    const currLeftKey = leftKey
    setLeftKey(rightKey)
    setRightKey(currLeftKey)
  }

  return (
    <Section p="xxlarge">
      <Box>
        <Flex bg="AliceBlue" padding="large" mb="xlarge" alignItems="center">
          <FlexItem>
            <Label htmlFor="base">Base</Label>
            <Select
              mt="xxsmall"
              id="base"
              name="Left Version"
              value={leftKey}
              options={options}
              onChange={handleLeftChange}
            />
          </FlexItem>
          <IconButton
            label="switch"
            size="small"
            icon="Sync"
            mt="medium"
            onClick={handleSwitch}
          />
          <FlexItem>
            <Label htmlFor="compare">Compare</Label>
            <Select
              mt="xxsmall"
              id="compare"
              name="Right Version"
              value={rightKey}
              options={options}
              onChange={handleRightChange}
            />
          </FlexItem>
          <FlexItem flex="2" ml="large">
            <Label htmlFor="options">Comparison Options</Label>
            <SelectMulti
              mt="xxsmall"
              id="options"
              name="toggles"
              placeholder="Comparison options"
              defaultValues={toggles}
              onChange={handleTogglesChange}
              options={diffToggles}
            />
          </FlexItem>
        </Flex>
      </Box>
      <DocDiff
        delta={delta}
        leftKey={leftKey}
        leftSpec={leftApi}
        rightKey={rightKey}
        rightSpec={rightApi}
      />
    </Section>
  )
}
