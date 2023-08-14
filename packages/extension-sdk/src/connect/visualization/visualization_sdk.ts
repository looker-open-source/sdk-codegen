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

import { NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR } from '../../util/errors'
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

class QueryResponseImpl implements QueryResponse {
  _queryResponse?: RawVisQueryResponse

  constructor(queryResponse?: RawVisQueryResponse) {
    this._queryResponse = queryResponse
  }

  update(queryResponse: RawVisQueryResponse) {
    this._queryResponse = queryResponse
  }

  get fieldMeasures(): Measure[] {
    return this._queryResponse?.fields?.measures || []
  }

  get fieldDimensions(): Dimension[] {
    return this._queryResponse?.fields?.dimensions || []
  }

  get fieldTableCalculations(): TableCalculation[] {
    return this._queryResponse?.fields?.table_calculations || []
  }

  get fieldPivots(): PivotConfig[] {
    return this._queryResponse?.fields?.pivots || []
  }

  get fieldMeasureLike(): Measure[] {
    return this._queryResponse?.fields?.measure_like || []
  }

  get fieldDimensionLike(): Dimension[] {
    return this._queryResponse?.fields?.dimension_like || []
  }

  get data(): Row[] {
    return this._queryResponse?.data || []
  }
}

class VisualizationConfigImpl implements VisualizationConfig {
  _visConfig?: RawVisConfig

  constructor(visConfig?: RawVisConfig) {
    this._visConfig = visConfig
  }

  update(visConfig: RawVisConfig) {
    this._visConfig = visConfig
  }

  get visConfig(): RawVisConfig | undefined {
    return this._visConfig
  }

  get queryFieldMeasures(): Measure[] {
    return this._visConfig?.query_fields?.measures || []
  }

  get queryFieldDimensions(): Dimension[] {
    return this._visConfig?.query_fields?.dimensions || []
  }

  get queryFieldTableCalculations(): TableCalculation[] {
    return this._visConfig?.query_fields?.table_calculations || []
  }

  get queryFieldPivots(): PivotConfig[] {
    return this._visConfig?.query_fields?.pivots || []
  }
}

export class VisualizationSDKImpl implements VisualizationSDK {
  hostApi: ExtensionHostApiImpl
  visualizationData?: RawVisualizationData
  _visConfig?: VisualizationConfigImpl
  _queryResponse?: QueryResponseImpl

  constructor(hostApi: ExtensionHostApiImpl) {
    this.hostApi = hostApi
  }

  updateVisData(visualizationData: RawVisualizationData) {
    // Ignore update messages if dashboard mounts not supported.
    // Should never happen.
    if (this.hostApi.isDashboardMountSupported) {
      this.visualizationData = visualizationData
      if (this.visConfig && this._visConfig) {
        this._visConfig.update(this.visualizationData.visConfig)
        this.hostApi.send(ExtensionRequestType.VIS_CONFIG_UPDATE, {
          updatedConfig: this.visualizationData.visConfig,
        })
      }
      if (this.queryResponse && this._queryResponse) {
        this._queryResponse.update(this.visualizationData.queryResponse)
      }
    }
  }

  configureVisualization(options: RawVisConfig): void {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.VIS_DEFAULT_CONFIG, { options })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  get visConfig(): VisualizationConfig {
    if (!this._visConfig) {
      this._visConfig = new VisualizationConfigImpl(
        this.visualizationData?.visConfig
      )
    }
    return this._visConfig
  }

  get queryResponse(): QueryResponse {
    if (!this._queryResponse) {
      this._queryResponse = new QueryResponseImpl(
        this.visualizationData?.queryResponse
      )
    }
    return this._queryResponse
  }
}
