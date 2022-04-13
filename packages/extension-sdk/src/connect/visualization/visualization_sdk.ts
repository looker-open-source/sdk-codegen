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

import type { ExtensionHostApiImpl } from '../extension_host_api'
import { ExtensionRequestType } from '../types'
import type { Row } from '../tile'
import type {
  VisualizationSDK,
  RawVisualizationData,
  RawVisConfig,
  VisualizationConfig,
  QueryResponse,
  Measure,
  Dimension,
  TableCalculation,
  PivotConfig,
  RawVisQueryResponse,
} from './types'

const defaultRawVizData: RawVisualizationData = {
  visConfig: {} as RawVisConfig,
  queryResponse: {} as RawVisQueryResponse,
}

class QueryResponseImpl implements QueryResponse {
  queryResponse: RawVisQueryResponse

  constructor(queryResponse: RawVisQueryResponse) {
    this.queryResponse = queryResponse
  }

  update(queryResponse: RawVisQueryResponse) {
    this.queryResponse = queryResponse
  }

  getRaw(): RawVisQueryResponse {
    return this.queryResponse
  }

  getFieldMeasures(): Measure[] {
    return this.queryResponse.fields?.measures || []
  }

  getFieldDimensions(): Dimension[] {
    return this.queryResponse.fields?.dimensions || []
  }

  getFieldTableCalculations(): TableCalculation[] {
    return this.queryResponse.fields?.table_calculations || []
  }

  getFieldPivots(): PivotConfig[] {
    return this.queryResponse.fields?.pivots || []
  }

  getFieldMeasureLike(): Measure[] {
    return this.queryResponse.fields?.measure_like || []
  }

  getFieldDimensionLike(): Dimension[] {
    return this.queryResponse.fields?.dimension_like || []
  }

  getData(): Row[] {
    return this.queryResponse.data || []
  }
}

class VisualizationConfigImpl implements VisualizationConfig {
  visConfig: RawVisConfig

  constructor(visConfig: RawVisConfig) {
    this.visConfig = visConfig
  }

  update(visConfig: RawVisConfig) {
    this.visConfig = visConfig
  }

  getRaw(): RawVisConfig {
    return this.visConfig
  }

  getQueryFieldMeasures(): Measure[] {
    return this.visConfig.query_fields?.measures || []
  }

  getQueryFieldDimensions(): Dimension[] {
    return this.visConfig.query_fields?.dimensions || []
  }

  getQueryFieldTableCalculations(): TableCalculation[] {
    return this.visConfig.query_fields?.table_calculations || []
  }

  getQueryFieldPivots(): PivotConfig[] {
    return this.visConfig.query_fields?.pivots || []
  }
}

export class VisualizationSDKImpl implements VisualizationSDK {
  hostApi: ExtensionHostApiImpl
  rawVisData: RawVisualizationData
  visConfig?: VisualizationConfigImpl
  queryResponse?: QueryResponseImpl

  constructor(hostApi: ExtensionHostApiImpl) {
    this.hostApi = hostApi
    this.rawVisData = defaultRawVizData
  }

  updateVisData(rawVisData: RawVisualizationData) {
    this.rawVisData = rawVisData
    if (this.visConfig) {
      this.visConfig.update(this.rawVisData.visConfig)
    }
    if (this.queryResponse) {
      this.queryResponse.update(this.rawVisData.queryResponse)
    }
  }

  configureVisualization(options: RawVisConfig): void {
    this.hostApi.send(ExtensionRequestType.VIS_DEFAULT_CONFIG, options)
  }

  getVisConfig(): VisualizationConfig {
    if (!this.visConfig) {
      this.visConfig = new VisualizationConfigImpl(this.rawVisData.visConfig)
    }
    return this.visConfig
  }

  getQueryResponse(): QueryResponse {
    if (!this.queryResponse) {
      this.queryResponse = new QueryResponseImpl(this.rawVisData?.queryResponse)
    }
    return this.queryResponse
  }
}
