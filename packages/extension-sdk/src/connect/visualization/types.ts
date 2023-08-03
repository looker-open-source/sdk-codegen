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

import type { Row } from '../tile'

/**
 * Callback that is invoked when visualization data is received
 * <code>Looker >=22.8</code>
 */
export type VisualizationDataReceivedCallback = (
  visualizationData: RawVisualizationData
) => void

/**
 * Raw visualization data. Basic typing for configuration data
 * and query data.
 * <code>Looker >=22.8</code>
 */
export interface RawVisualizationData {
  visConfig: RawVisConfig
  queryResponse: RawVisQueryResponse
}

/**
 * Visualization configuration. Configuration data set in the
 * explore.
 * <code>Looker >=22.8</code>
 */
export interface RawVisConfig {
  [key: string]: RawVisConfigValue
}

export type RawVisConfigValue = any

/**
 * Query response data
 * <code>Looker >=22.8</code>
 */
export interface RawVisQueryResponse {
  [key: string]: any
  data: RawVisData
  fields: {
    [key: string]: any[]
  }
  pivots: RawPivotConfig[]
}

export type RawVisData = Row[]

export interface RawPivotConfig {
  key: string
  is_total: boolean
  data: { [key: string]: string }
  metadata: { [key: string]: { [key: string]: string } }
}

export interface Measure extends RawVisConfig {
  [key: string]: any
}

export interface Dimension extends RawVisConfig {
  [key: string]: any
}

export interface TableCalculation {
  [key: string]: any
}

export interface PivotConfig extends RawPivotConfig {
  [key: string]: any
}

export interface VisualizationConfig {
  queryFieldMeasures: Measure[]
  queryFieldDimensions: Dimension[]
  queryFieldTableCalculations: TableCalculation[]
  queryFieldPivots: PivotConfig[]
}

export interface QueryResponse {
  data: Row[]
  fieldMeasures: Measure[]
  fieldDimensions: Dimension[]
  fieldTableCalculations: TableCalculation[]
  fieldPivots: PivotConfig[]
  fieldMeasureLike: Measure[]
  fieldDimensionLike: Dimension[]
}

/**
 * Extension visualization SDK
 */
export interface VisualizationSDK {
  visualizationData?: RawVisualizationData
  visConfig: VisualizationConfig
  queryResponse: QueryResponse
  updateVisData: (rawVisData: RawVisualizationData) => void
  configureVisualization: (options: RawVisConfig) => void
}
