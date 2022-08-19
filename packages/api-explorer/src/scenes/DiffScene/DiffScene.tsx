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
import React, { useState, useEffect } from 'react'
import type { ApiModel, DiffRow, SpecList } from '@looker/sdk-codegen'
import { useRouteMatch } from 'react-router-dom'
import {
  Box,
  Flex,
  FlexItem,
  IconButton,
  Label,
  Select,
  SelectMulti,
} from '@looker/components'
import { SyncAlt } from '@styled-icons/material/SyncAlt'
import { useSelector } from 'react-redux'

import { ApixSection } from '../../components'
import {
  selectCurrentSpec,
  selectSpecs,
  selectDiffOptions,
  useSettingActions,
} from '../../state'
import { diffPath, getApixAdaptor, useNavigation } from '../../utils'
import { useDiffStoreSync } from '../utils'
import { diffSpecs, getDiffOptionsFromUrl } from './diffUtils'
import { DocDiff } from './DocDiff'

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

export interface DiffSceneProps {
  toggleNavigation: (target?: boolean) => void
}

const validateParam = (specs: SpecList, specKey = '') => {
  return specs[specKey] ? specKey : ''
}

export const DiffScene: FC<DiffSceneProps> = ({ toggleNavigation }) => {
  const adaptor = getApixAdaptor()
  const { navigate } = useNavigation()
  const selectedDiffOptions = useSelector(selectDiffOptions)
  const { setDiffOptionsAction } = useSettingActions()
  const spec = useSelector(selectCurrentSpec)
  const specs = useSelector(selectSpecs)
  const currentSpecKey = spec.key
  const match = useRouteMatch<{ l: string; r: string }>(`/:l/${diffPath}/:r?`)
  const l = validateParam(specs, match?.params.l)
  const r = validateParam(specs, match?.params.r)

  const options = Object.entries(specs).map(([key, spec]) => ({
    value: key,
    label: `${key} (${spec.status})`,
  }))

  const [leftKey, setLeftKey] = useState<string>(l || currentSpecKey)
  const [rightKey, setRightKey] = useState<string>(r || '')
  const [leftApi, setLeftApi] = useState<ApiModel>(specs[leftKey].api!)
  const [rightApi, setRightApi] = useState<ApiModel>(() =>
    rightKey ? specs[rightKey].api! : specs[leftKey].api!
  )
  const [toggles, setToggles] = useState<string[]>(selectedDiffOptions)
  useDiffStoreSync()

  useEffect(() => {
    if (r !== rightKey) {
      setRightKey(r)
    }
  }, [r, rightKey])

  useEffect(() => {
    if (l !== leftKey) {
      setLeftKey(l)
    }
  }, [l, leftKey])

  useEffect(() => {
    toggleNavigation(false)
  }, [])

  const [delta, setDelta] = useState<DiffRow[]>([])

  const handleLeftChange = (newLeft: string) => {
    navigate(`/${newLeft}/${diffPath}/${rightKey}`)
  }
  const handleRightChange = (newRight: string) => {
    navigate(`/${leftKey}/${diffPath}/${newRight}`)
  }

  const handleSwitch = () => {
    navigate(`/${rightKey}/${diffPath}/${leftKey}`)
  }

  useEffect(() => {
    adaptor.fetchSpec(specs[leftKey]).then((spec) => setLeftApi(spec.api!))
  }, [leftKey])

  useEffect(() => {
    if (rightKey in specs) {
      adaptor.fetchSpec(specs[rightKey]).then((spec) => setRightApi(spec.api!))
    }
  }, [rightKey])

  useEffect(() => {
    if (leftApi && rightApi) {
      setDelta([...diffSpecs(leftApi, rightApi, toggles)])
    }
  }, [leftApi, rightApi, toggles])

  const handleTogglesChange = (values?: string[]) => {
    const newToggles = values || []
    navigate(location.pathname, { opts: newToggles.join(',') })
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const diffOptionsParam = getDiffOptionsFromUrl(searchParams.get('opts'))
    setDiffOptionsAction({
      diffOptions: diffOptionsParam || [],
    })
  }, [location.search])

  useEffect(() => {
    setToggles(selectedDiffOptions)
  }, [selectedDiffOptions])

  return (
    <ApixSection>
      <Box>
        <Flex bg="AliceBlue" padding="large" mb="large" alignItems="center">
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
            className="switch-button"
            label="switch"
            size="small"
            disabled={!leftKey || !rightKey}
            icon={<SyncAlt />}
            mt="medium"
            onClick={handleSwitch}
          />
          <FlexItem>
            <Label htmlFor="compare">Compare</Label>
            <Select
              mt="xxsmall"
              id="compare"
              name="Right Version"
              placeholder="Select a comparison..."
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
              values={toggles}
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
    </ApixSection>
  )
}
