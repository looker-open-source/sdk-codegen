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

export interface Pivot {
  key: string
  is_total: boolean
  data: { [key: string]: string }
  metadata: { [key: string]: { [key: string]: string | Link[] } }
  labels: { [key: string]: string }
  sort_values?: { [key: string]: string }
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

export interface PivotCell {
  [pivotKey: string]: Cell
}

export interface Row {
  [fieldName: string]: PivotCell | Cell
}

export interface TileError {
  title: string
  message: string
  group: string
}

export type CrossfilterEvent = Partial<MouseEvent>

export interface CrossfilterOptions {
  event: CrossfilterEvent
  pivot: Pivot
  row: Row
}

// TODO build out type
export type TriggerConfig = any

// TODO build out type
export type DrillMenuOptions = any

export interface Filters {
  [key: string]: string
}

export interface TileSDK {
  addErrors: (...errors: TileError[]) => void
  clearErrors: (group?: string) => void
  trigger: (message: string, config: TriggerConfig[]) => void
  openDrillMenu: (options: DrillMenuOptions) => void
  toggleCrossFilter: (options: CrossfilterOptions) => void
  runDashboard: () => void
  stopDashboard: () => void
  updateFilters: (filters: Filters) => void
  openScheduleDialog: () => Promise<void>
}
