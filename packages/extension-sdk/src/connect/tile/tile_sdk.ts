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
import { NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR } from '../../util/errors'
import { ExtensionRequestType } from '../types'
import type { ExtensionHostApiImpl } from '../extension_host_api'
import type {
  TileError,
  DrillMenuOptions,
  CrossFilterOptions,
  Filters,
  TileHostData,
  TileSDKInternal,
} from './types'
import { DashboardRunState } from './types'

const defaultHostData: TileHostData = {
  isDashboardEditing: false,
  dashboardRunState: DashboardRunState.UNKNOWN,
  dashboardFilters: {},
}
export class TileSDKImpl implements TileSDKInternal {
  hostApi: ExtensionHostApiImpl
  tileHostData: TileHostData

  constructor(hostApi: ExtensionHostApiImpl) {
    this.hostApi = hostApi
    this.tileHostData = { ...defaultHostData }
  }

  tileHostDataChanged(partialHostData: Partial<TileHostData>) {
    // Ignore update messages if dashboard mounts not supported.
    // Should never happen.
    if (this.hostApi.isDashboardMountSupported) {
      this.tileHostData = { ...this.tileHostData, ...partialHostData }
    }
  }

  addError(error: TileError) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_ADD_ERRORS, {
        errors: [error],
      })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  clearError() {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_CLEAR_ERRORS, {
        group: undefined,
      })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  addErrors(...errors: TileError[]) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_ADD_ERRORS, { errors })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  clearErrors(group?: string) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_CLEAR_ERRORS, { group })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  openDrillMenu(options: DrillMenuOptions, event?: MouseEvent) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_OPEN_DRILL_MENU, {
        options,
        event: this.sanitizeEvent(event),
      })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  toggleCrossFilter(options: CrossFilterOptions, event?: MouseEvent) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_TOGGLE_CROSS_FILTER, {
        options,
        event: this.sanitizeEvent(event),
      })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  runDashboard() {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_RUN_DASHBOARD, {})
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  stopDashboard() {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_STOP_DASHBOARD, {})
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  updateFilters(filters: Filters, run = false) {
    if (this.hostApi.isDashboardMountSupported) {
      this.hostApi.send(ExtensionRequestType.TILE_UPDATE_FILTERS, {
        filters,
        run,
      })
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
  }

  openScheduleDialog() {
    if (this.hostApi.isDashboardMountSupported) {
      return this.hostApi.sendAndReceive(
        ExtensionRequestType.TILE_OPEN_SCHEDULE_DIALOG,
        {}
      )
    } else {
      throw NOT_DASHBOARD_MOUNT_NOT_SUPPORTED_ERROR
    }
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
