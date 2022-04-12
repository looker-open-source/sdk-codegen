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
} from './types'

export class TileSDKImpl implements TileSDK {
  hostApi: ExtensionHostApiImpl

  constructor(hostApi: ExtensionHostApiImpl) {
    this.hostApi = hostApi
  }

  addErrors(...errors: TileError[]) {
    this.hostApi.send(ExtensionRequestType.TILE_ADD_ERRORS, errors)
  }

  clearErrors(group?: string) {
    this.hostApi.send(ExtensionRequestType.TILE_CLEAR_ERRORS, group)
  }

  trigger(message: string, config: TriggerConfig[]) {
    this.hostApi.send(ExtensionRequestType.TILE_TRIGGER, { message, config })
  }

  openDrillMenu(options: DrillMenuOptions) {
    this.hostApi.send(ExtensionRequestType.TILE_OPEN_DRILL_MENU, options)
  }

  toggleCrossFilter(options: CrossfilterOptions) {
    this.hostApi.send(ExtensionRequestType.TILE_TOGGLE_CROSS_FILTER, options)
  }
}
