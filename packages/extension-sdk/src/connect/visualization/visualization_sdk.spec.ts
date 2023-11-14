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
import type { ExtensionHostApiImpl } from '../extension_host_api'
import { VisualizationSDKImpl } from './visualization_sdk'
import type {
  RawVisualizationData,
  RawVisQueryResponse,
  RawVisConfig,
} from './types'

describe('VisualizationSDK', () => {
  let api: ExtensionHostApiImpl
  beforeEach(() => {
    api = {
      isDashboardMountSupported: true,
      send: jest.fn(),
      sendAndReceive: jest.fn(),
    } as unknown as ExtensionHostApiImpl
  })

  it('constructs', () => {
    const sdk = new VisualizationSDKImpl(api)
    expect(sdk.visualizationData).toBeUndefined()
    expect(sdk.visConfig).toBeDefined()
    expect(sdk.visConfig.queryFieldMeasures).toEqual([])
    expect(sdk.visConfig.queryFieldDimensions).toEqual([])
    expect(sdk.visConfig.queryFieldTableCalculations).toEqual([])
    expect(sdk.visConfig.queryFieldPivots).toEqual([])
    expect(sdk.queryResponse).toBeDefined()
    expect(sdk.queryResponse.fieldMeasures).toEqual([])
    expect(sdk.queryResponse.fieldDimensions).toEqual([])
    expect(sdk.queryResponse.fieldTableCalculations).toEqual([])
    expect(sdk.queryResponse.fieldPivots).toEqual([])
    expect(sdk.queryResponse.fieldMeasureLike).toEqual([])
    expect(sdk.queryResponse.fieldDimensionLike).toEqual([])
    expect(sdk.queryResponse.data).toEqual([])
  })

  it('updates host data and convenience functions work correcly', () => {
    const sdk = new VisualizationSDKImpl(api)
    expect(sdk.visualizationData).toBeUndefined()
    const visConfig: RawVisConfig = {
      query_fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
      },
    }
    const queryResponse: RawVisQueryResponse = {
      data: [{ abc: { value: 'xyz' } }],
      fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
        measure_like: [{ a: 'e' }],
        dimension_like: [{ a: 'f' }],
      },
      pivots: [],
    }
    const visualizationData: RawVisualizationData = {
      visConfig,
      queryResponse,
    }
    sdk.updateVisData(visualizationData)
    expect(sdk.visualizationData).toEqual(visualizationData)
    expect(sdk.visConfig.queryFieldMeasures).toEqual(
      visConfig.query_fields.measures
    )
    expect(sdk.visConfig.queryFieldDimensions).toEqual(
      visConfig.query_fields.dimensions
    )
    expect(sdk.visConfig.queryFieldTableCalculations).toEqual(
      visConfig.query_fields.table_calculations
    )
    expect(sdk.visConfig.queryFieldPivots).toEqual(
      visConfig.query_fields.pivots
    )
    expect(sdk.queryResponse.fieldMeasures).toEqual(
      queryResponse.fields.measures
    )
    expect(sdk.queryResponse.fieldDimensions).toEqual(
      queryResponse.fields.dimensions
    )
    expect(sdk.queryResponse.fieldTableCalculations).toEqual(
      queryResponse.fields.table_calculations
    )
    expect(sdk.queryResponse.fieldPivots).toEqual(queryResponse.fields.pivots)
    expect(sdk.queryResponse.fieldMeasureLike).toEqual(
      queryResponse.fields.measure_like
    )
    expect(sdk.queryResponse.fieldDimensionLike).toEqual(
      queryResponse.fields.dimension_like
    )
  })

  it('does not update host data when dashboard tile mount not supported', () => {
    api = {
      ...api,
      isDashboardMountSupported: false,
    } as unknown as ExtensionHostApiImpl
    const sdk = new VisualizationSDKImpl(api)
    expect(sdk.visualizationData).toBeUndefined()
    const visConfig: RawVisConfig = {
      query_fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
      },
    }
    const queryResponse: RawVisQueryResponse = {
      data: [{ abc: { value: 'xyz' } }],
      fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
        measure_like: [{ a: 'e' }],
        dimension_like: [{ a: 'f' }],
      },
      pivots: [],
    }
    const visualizationData: RawVisualizationData = {
      visConfig,
      queryResponse,
    }
    sdk.updateVisData(visualizationData)
    expect(sdk.visualizationData).toBeUndefined()
  })

  it('updates visConfig and queryResponse locally when provided', () => {
    const sdk = new VisualizationSDKImpl(api)
    expect(sdk.visualizationData).toBeUndefined()
    const visConfig: RawVisConfig = {
      query_fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
      },
    }
    const queryResponse: RawVisQueryResponse = {
      data: [{ abc: { value: 'xyz' } }],
      fields: {
        measures: [{ a: 'a' }],
        dimensions: [{ a: 'b' }],
        table_calculations: [{ a: 'c' }],
        pivots: [{ a: 'd' }],
        measure_like: [{ a: 'e' }],
        dimension_like: [{ a: 'f' }],
      },
      pivots: [],
    }
    const visualizationData: RawVisualizationData = {
      visConfig,
      queryResponse,
    }
    sdk.updateVisData(visualizationData)
    expect(sdk.visualizationData).toEqual(visualizationData)
    expect(sdk.visConfig.visConfig).toEqual(visConfig)

    const updatedVisConfig = {
      ...visConfig,
      background_color: 'blue',
    } as RawVisConfig
    const updatedVisualizationData: RawVisualizationData = {
      visConfig: updatedVisConfig,
      queryResponse,
    }

    sdk.updateVisData(updatedVisualizationData)
    expect(sdk.visualizationData).toEqual(updatedVisualizationData)
    expect(sdk.visConfig.visConfig).toEqual(updatedVisConfig)
  })
})
