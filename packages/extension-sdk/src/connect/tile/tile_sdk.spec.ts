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
import { TileSDKImpl } from './tile_sdk'
import type { CrossFilterOptions } from './types'
import { DashboardRunState } from './types'

describe('TileSDK', () => {
  let api: ExtensionHostApiImpl
  beforeEach(() => {
    api = {
      send: jest.fn(),
      sendAndReceive: jest.fn(),
    } as unknown as ExtensionHostApiImpl
  })

  const makeTileSdk = () => {
    const tileSdk = new TileSDKImpl(api)
    tileSdk.tileHostDataChanged({
      isEditing: true,
      dashboardRunState: DashboardRunState.COMPLETE,
      filters: { hello: 'world' },
    })
    return tileSdk
  }

  const makeEvent = (props: any = {}) => {
    return {
      metaKey: true,
      pageX: 20,
      pageY: 40,
      type: 'click',
      ...props,
    }
  }

  it('constructs', () => {
    const tileSdk = new TileSDKImpl(api)
    const { isEditing, dashboardRunState, filters } = tileSdk.tileHostData
    expect(isEditing).toEqual(false)
    expect(dashboardRunState).toEqual('UNKNOWN')
    expect(filters).toEqual({})
  })

  it('updates host data', () => {
    const tileSdk = new TileSDKImpl(api)
    tileSdk.tileHostDataChanged({
      isEditing: true,
      dashboardRunState: DashboardRunState.RUNNING,
      filters: { hello: 'world' },
    })
    const { isEditing, dashboardRunState, filters } = tileSdk.tileHostData
    expect(isEditing).toEqual(true)
    expect(dashboardRunState).toEqual('RUNNING')
    expect(filters).toEqual({ hello: 'world' })
  })

  it('sends add errors message ', () => {
    const message1 = { title: 'Title1', message: 'Message1', group: 'abc' }
    const message2 = { title: 'Title2', message: 'Message2', group: 'abc' }
    const tileSdk = makeTileSdk()
    tileSdk.addErrors(message1, message2)
    expect(api.send).toBeCalledWith('TILE_ADD_ERRORS', {
      errors: [message1, message2],
    })
  })

  it('sends clear errors message ', () => {
    const tileSdk = makeTileSdk()
    tileSdk.clearErrors('abc')
    expect(api.send).toBeCalledWith('TILE_CLEAR_ERRORS', { group: 'abc' })
  })

  it('sends trigger message ', () => {
    const tileSdk = makeTileSdk()
    const config = [{ hello: 'world' }]
    const message = 'message1'
    tileSdk.trigger(message, config, makeEvent(config))
    expect(api.send).toBeCalledWith('TILE_TRIGGER', {
      message,
      config,
      event: makeEvent(),
    })
  })

  it('sends open drill menu message ', () => {
    const tileSdk = makeTileSdk()
    const options = { hello: 'world' }
    tileSdk.openDrillMenu(options, makeEvent(options))
    expect(api.send).toBeCalledWith('TILE_OPEN_DRILL_MENU', {
      options,
      event: makeEvent(),
    })
  })

  it('sends toggle cross filter message ', () => {
    const tileSdk = makeTileSdk()
    const options = { row: {}, pivot: {} } as CrossFilterOptions
    tileSdk.toggleCrossFilter(options, makeEvent(options))
    expect(api.send).toBeCalledWith('TILE_TOGGLE_CROSS_FILTER', {
      options,
      event: makeEvent(),
    })
  })

  it('sends run dashboard message ', () => {
    const tileSdk = makeTileSdk()
    tileSdk.runDashboard()
    expect(api.send).toBeCalledWith('TILE_RUN_DASHBOARD', {})
  })

  it('sends stop dashboard message ', () => {
    const tileSdk = makeTileSdk()
    tileSdk.stopDashboard()
    expect(api.send).toBeCalledWith('TILE_STOP_DASHBOARD', {})
  })

  it('sends update filters message ', () => {
    const tileSdk = makeTileSdk()
    const filters = { hello: 'world' }
    tileSdk.updateFilters(filters)
    expect(api.send).toBeCalledWith('TILE_UPDATE_FILTERS', {
      filters,
    })
  })

  it('sends open schedule dialog message ', () => {
    const tileSdk = makeTileSdk()
    tileSdk.openScheduleDialog()
    expect(api.sendAndReceive).toBeCalledWith('TILE_OPEN_SCHEDULE_DIALOG', {})
  })
})
