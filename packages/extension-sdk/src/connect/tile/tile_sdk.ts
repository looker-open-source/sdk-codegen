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

import type { MouseEvent } from 'react'
import { ExtensionRequestType } from '../types'
import type { ExtensionHostApiImpl } from '../extension_host_api'
import type {
  TileSDK,
  TileError,
  DrillMenuOptions,
  TriggerConfig,
  CrossFilterOptions,
  Filters,
  TileHostData,
} from './types'
import { DashboardRunState } from './types'

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

  tileHostDataChanged(partialHostData: Partial<TileHostData>) {
    this.tileHostData = { ...this.tileHostData, ...partialHostData }
  }

  addErrors(...errors: TileError[]) {
    this.hostApi.send(ExtensionRequestType.TILE_ADD_ERRORS, { errors })
  }

  clearErrors(group?: string) {
    this.hostApi.send(ExtensionRequestType.TILE_CLEAR_ERRORS, { group })
  }

  trigger(message: string, config: TriggerConfig[], event?: MouseEvent) {
    this.hostApi.send(ExtensionRequestType.TILE_TRIGGER, {
      message,
      config,
      event: this.sanitizeEvent(event),
    })
  }

  openDrillMenu(options: DrillMenuOptions, event?: MouseEvent) {
    this.hostApi.send(ExtensionRequestType.TILE_OPEN_DRILL_MENU, {
      options,
      event: this.sanitizeEvent(event),
    })
  }

  toggleCrossFilter(options: CrossFilterOptions, event?: MouseEvent) {
    this.hostApi.send(ExtensionRequestType.TILE_TOGGLE_CROSS_FILTER, {
      options,
      event: this.sanitizeEvent(event),
    })
  }

  runDashboard() {
    this.hostApi.send(ExtensionRequestType.TILE_RUN_DASHBOARD, {})
  }

  stopDashboard() {
    this.hostApi.send(ExtensionRequestType.TILE_STOP_DASHBOARD, {})
  }

  updateFilters(filters: Filters) {
    this.hostApi.send(ExtensionRequestType.TILE_UPDATE_FILTERS, {
      filters,
    })
  }

  openScheduleDialog() {
    return this.hostApi.sendAndReceive(
      ExtensionRequestType.TILE_OPEN_SCHEDULE_DIALOG,
      {}
    )
  }

  sanitizeEvent(event?: MouseEvent) {
    if (event) {
      return {
        metaKey: event.metaKey,
        pageX: event.pageX,
        pageY: event.pageY,
        type: event.type,
      }
    }
    return undefined
  }
}
