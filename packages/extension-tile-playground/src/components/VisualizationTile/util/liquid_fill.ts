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

import type { RawVisConfig, VisualizationSDK } from '@looker/extension-sdk'
import { defaultConfig } from '../../LiquidFillGaugeViz/liquid_fill_gauge'

export const getValueAndFormat = (
  visualizationSDK: VisualizationSDK
): { value: any; valueFormat: any } => {
  // TODO add error checking
  const visConfig = {
    ...defaultConfig,
    ...visualizationSDK.visConfig,
  } as RawVisConfig

  const queryResponse = visualizationSDK.queryResponse
  const { data } = queryResponse

  const datumField = queryResponse.fieldMeasureLike[0]
  if (!datumField) {
    return { value: undefined, valueFormat: undefined }
  }
  const valueFormat = visConfig.displayPercent ? null : datumField.value_format
  const datum = data[0][datumField.name]
  let value = datum.value

  const compareField = queryResponse.fieldMeasureLike[1]
  if (compareField && visConfig.showComparison) {
    const compareDatum = data[0][compareField.name]
    visConfig.maxValue = compareDatum.value
  }

  if (visConfig.displayPercent) {
    value = (datum.value / visConfig.maxValue) * 100
    visConfig.maxValue = 100
  }

  return { value, valueFormat }
}

export const liquidFillDefaultConfig = {
  showComparison: {
    label: 'Use field comparison',
    default: false,
    section: 'Value',
    type: 'boolean',
  },
  minValue: {
    label: 'Min value',
    min: 0,
    default: defaultConfig.minValue,
    section: 'Value',
    type: 'number',
    placeholder: 'Any positive number',
  },
  maxValue: {
    label: 'Max value',
    min: 0,
    default: defaultConfig.maxValue,
    section: 'Value',
    type: 'number',
    placeholder: 'Any positive number',
  },
  circleThickness: {
    label: 'Circle Thickness',
    min: 0,
    max: 1,
    step: 0.05,
    default: defaultConfig.circleThickness,
    section: 'Style',
    type: 'number',
    display: 'range',
  },
  circleFillGap: {
    label: 'Circle Gap',
    min: 0,
    max: 1,
    step: 0.05,
    default: defaultConfig.circleFillGap,
    section: 'Style',
    type: 'number',
    display: 'range',
  },
  circleColor: {
    label: 'Circle Color',
    default: defaultConfig.circleColor,
    section: 'Style',
    type: 'string',
    display: 'color',
  },
  waveHeight: {
    label: 'Wave Height',
    min: 0,
    max: 1,
    step: 0.05,
    default: defaultConfig.waveHeight,
    section: 'Waves',
    type: 'number',
    display: 'range',
  },
  waveCount: {
    label: 'Wave Count',
    min: 0,
    max: 10,
    default: defaultConfig.waveCount,
    section: 'Waves',
    type: 'number',
    display: 'range',
  },
  waveRiseTime: {
    label: 'Wave Rise Time',
    min: 0,
    max: 5000,
    step: 50,
    default: defaultConfig.waveRiseTime,
    section: 'Waves',
    type: 'number',
    display: 'range',
  },
  waveAnimateTime: {
    label: 'Wave Animation Time',
    min: 1,
    max: 5000,
    step: 50,
    default: defaultConfig.waveAnimateTime,
    section: 'Waves',
    type: 'number',
    display: 'range',
  },
  waveRise: {
    label: 'Wave Rise from Bottom',
    default: defaultConfig.waveRise,
    section: 'Waves',
    type: 'boolean',
  },
  waveHeightScaling: {
    label: 'Scale waves if high or low',
    default: defaultConfig.waveHeightScaling,
    section: 'Waves',
    type: 'boolean',
  },
  waveAnimate: {
    label: 'Animate Waves',
    default: true,
    section: 'Waves',
    type: 'boolean',
  },
  waveColor: {
    label: 'Wave Color',
    default: '#64518A',
    section: 'Style',
    type: 'string',
    display: 'color',
  },
  waveOffset: {
    label: 'Wave Offset',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0,
    section: 'Waves',
    type: 'number',
    display: 'range',
  },
  textVertPosition: {
    label: 'Text Vertical Offset',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    section: 'Value',
    type: 'number',
    display: 'range',
  },
  textSize: {
    label: 'Text Size',
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    section: 'Value',
    type: 'number',
    display: 'range',
  },
  valueCountUp: {
    label: 'Animate to Value',
    default: true,
    section: 'Waves',
    type: 'boolean',
  },
  displayPercent: {
    label: 'Display as Percent',
    default: true,
    section: 'Value',
    type: 'boolean',
  },
  textColor: {
    label: 'Text Color (non-overlapped)',
    default: '#000000',
    section: 'Style',
    type: 'string',
    display: 'color',
  },
  waveTextColor: {
    label: 'Text Color (overlapped)',
    default: '#FFFFFF',
    section: 'Style',
    type: 'string',
    display: 'color',
  },
}
