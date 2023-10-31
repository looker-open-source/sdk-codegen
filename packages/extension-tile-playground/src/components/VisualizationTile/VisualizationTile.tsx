/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useContext, useEffect, useCallback, useMemo } from 'react'
import { SpaceVertical, Text, Button } from '@looker/components'
import { More } from '@looker/icons'
import { ExtensionContext40 } from '@looker/extension-sdk-react'
import { useWindowSize } from '../../hooks/use_window_size'
import { LiquidFillGaugeViz } from '../LiquidFillGaugeViz'
import { Layout } from '../Layout'
import { NavigateButton } from '../NavigateButton'
import { liquidFillVisOptions, getValueAndFormat } from './util/liquid_fill'

export const VisualizationTile: React.FC = () => {
  const { height, width } = useWindowSize()
  const vizSize = Math.min(height, width) - 250
  const { visualizationData, visualizationSDK, extensionSDK } =
    useContext(ExtensionContext40)

  const { value, valueFormat } = useMemo(() => {
    if (visualizationData) {
      return getValueAndFormat(visualizationSDK)
    }
    return { value: undefined, valueFormat: null }
  }, [visualizationData, visualizationSDK])

  useEffect(() => {
    if (visualizationSDK) {
      visualizationSDK.configureVisualization(liquidFillVisOptions)
    }
  }, [visualizationSDK])

  const toggleBackgroundColor = () => {
    if (visualizationData?.visConfig?.circleColor === 'red') {
      visualizationSDK.setVisConfig({ circleColor: 'blue' })
    } else {
      visualizationSDK.setVisConfig({ circleColor: 'red' })
    }
  }

  const renderComplete = useCallback(() => {
    if (visualizationData) {
      extensionSDK.rendered()
    }
  }, [extensionSDK, visualizationData])

  return (
    <Layout right={<NavigateButton path="/inspect" icon={<More />} />}>
      <SpaceVertical p="xxxxxlarge" width="100%" align="center">
        <Text p="xxxxxlarge" fontSize="xxxxxlarge">
          Visualization Tile
        </Text>
        <Button onClick={toggleBackgroundColor}>Change background color</Button>
        {value && (
          <LiquidFillGaugeViz
            width={vizSize}
            height={vizSize}
            value={value}
            renderComplete={renderComplete}
            valueFormat={valueFormat}
          />
        )}
        {!value && (
          <Text>
            Unfortunately there is not a valid value to render in the
            visualization.
          </Text>
        )}
      </SpaceVertical>
    </Layout>
  )
}
