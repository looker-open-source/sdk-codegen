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

/**
 * <code>Looker >=22.8</code>
 */
export type VisualizationDataReceivedCallback = (
  visualizationData: VisualizationData
) => void

/**
 * <code>Looker >=22.8</code>
 */
export interface VisualizationData {
  visConfig: VisConfig
  queryResponse: VisQueryResponse
}

/**
 * Visualization configuration
 *
 * <code>Looker >=22.8</code>
 */
export interface VisConfig {
  [key: string]: VisConfigValue
}

export type VisConfigValue = any

/**
 * Query response data
 * <code>Looker >=22.8</code>
 */
export interface VisQueryResponse {
  [key: string]: any
  data: VisData
  fields: {
    [key: string]: any[]
  }
  pivots: Pivot[]
}

export interface Row {
  [fieldName: string]: PivotCell | Cell
}

export type VisData = Row[]

export interface Pivot {
  key: string
  is_total: boolean
  data: { [key: string]: string }
  metadata: { [key: string]: { [key: string]: string } }
}

export interface PivotCell {
  [pivotKey: string]: Cell
}

export interface Cell {
  [key: string]: any
  value: any
  rendered?: string
  html?: string
  links?: Link[]
}

export interface Link {
  label: string
  type: string
  type_label: string
  url: string
}
