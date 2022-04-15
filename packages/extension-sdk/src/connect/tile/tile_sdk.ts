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
import { ExtensionRequestType } from '../types'
import type { ExtensionHostApiImpl } from '../extension_host_api'
import type {
  TileSDK,
  TileError,
  DrillMenuOptions,
  TriggerConfig,
  CrossfilterOptions,
  Filters,
  TileHostData,
  TileHostDataChangedDetail,
} from './types'
import { TileHostChangeType, DashboardRunState } from './types'

const defaultHostData: TileHostData = {
  isEditing: false,
  dashboardRunState: DashboardRunState.UNKNOWN,
  filters: {},
}
export class TileSDKImpl implements TileSDK {
  hostApi: ExtensionHostApiImpl
  tileHostData: TileHostData

  constructor(hostApi: ExtensionHostApiImpl) {
    this.hostApi = hostApi
    this.tileHostData = { ...defaultHostData }
  }

  tileHostDataChanged(changeDetail: TileHostDataChangedDetail) {
    switch (changeDetail.changeType) {
      case TileHostChangeType.START_EDITING: {
        this.tileHostData.isEditing = true
        break
      }
      case TileHostChangeType.STOP_EDITING: {
        this.tileHostData.isEditing = true
        break
      }
      case TileHostChangeType.DASHBOARD_LOADED: {
        this.tileHostData.dashboardRunState = DashboardRunState.LOADED
        break
      }
      case TileHostChangeType.DASHBOARD_RUN_START: {
        this.tileHostData.dashboardRunState = DashboardRunState.RUNNING
        break
      }
      case TileHostChangeType.DASHBOARD_RUN_COMPLETE: {
        this.tileHostData.dashboardRunState = DashboardRunState.COMPLETE
        break
      }
      case TileHostChangeType.DASHBOARD_FILTERS_CHANGED: {
        this.tileHostData.filters = changeDetail.filters || {}
        this.tileHostData.isCrossFiltersEnabled =
          changeDetail.isCrossFiltersEnabled || false
        break
      }
    }
  }

  addErrors(...errors: TileError[]) {
    this.hostApi.send(ExtensionRequestType.TILE_ADD_ERRORS, { errors })
  }

  clearErrors(group?: string) {
    this.hostApi.send(ExtensionRequestType.TILE_CLEAR_ERRORS, { group })
  }

  trigger(message: string, config: TriggerConfig[]) {
    this.hostApi.send(ExtensionRequestType.TILE_TRIGGER, { message, config })
  }

  openDrillMenu(options: DrillMenuOptions) {
    this.hostApi.send(ExtensionRequestType.TILE_OPEN_DRILL_MENU, { options })
  }

  toggleCrossFilter(options: CrossfilterOptions) {
    this.hostApi.send(ExtensionRequestType.TILE_TOGGLE_CROSS_FILTER, {
      options,
    })
  }

  runDashboard() {
    this.hostApi.send(ExtensionRequestType.TILE_RUN_DASHBOARD, {})
  }

  stopDashboard() {
    this.hostApi.send(ExtensionRequestType.TILE_STOP_DASHBOARD, {})
  }

  updateFilters(filters: Filters) {
    this.hostApi.send(ExtensionRequestType.TILE_TOGGLE_CROSS_FILTER, {
      filters,
    })
  }

  openScheduleDialog() {
    return this.hostApi.sendAndReceive(
      ExtensionRequestType.TILE_OPEN_SCHEDULE_DIALOG,
      {}
    )
  }
}
