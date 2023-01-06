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

/**
 * Callback that is invoked when a change in the host happens
 * <code>Looker >=22.8</code>
 */
export type TileHostDataChangedCallback = (
  tileHostData: Partial<TileHostData>
) => void

/**
 * Defines the current run state of the dashboard
 */
export enum DashboardRunState {
  UNKNOWN = 'UNKNOWN',
  RUNNING = 'RUNNING',
  NOT_RUNNING = 'NOT_RUNNING',
}

export interface TileHostData {
  /**
   * When true indicates that the tile is being configured as
   * a visualization inside of an explore.
   */
  isExploring?: boolean
  /**
   * The dashboard id the tile is being rendered in. If the tile
   * is being configured as an explore this will not be populated.
   */
  dashboardId?: string
  /**
   * The element id of the tile being rendered. If the tile
   * is being configured as an explore this will not be populated.
   */
  elementId?: string
  /**
   * The query id of the tile being rendered if it is associated with
   * a visualization. If the tile is being configured as an explore
   * this will not be populated.
   *
   * Note that queryId is that of the query created when the visualization
   * is built in the Looker explore. It does not contain any filters or
   * cross filtering applied to the dashboard. Filters and cross filters
   * will need to be applied and a new query generated in order to reflect
   * the data shown in the QueryResponse. As such the queryId may not be
   * that useful.
   */
  queryId?: string
  /**
   * The query slug of the tile being rendered if it is associated with
   * a visualization. If the tile is being configured as an explore
   * this will not be populated.
   *
   * Note that querySlug is that of the query created when the visualization
   * is built in the Looker explore. It does not contain any filters or
   * cross filtering applied to the dashboard. Filters and cross filters
   * will need to be applied and a new query generated in order to reflect
   * the data shown in the QueryResponse. As such the queryId may not be
   * that useful.
   */
  querySlug?: string
  /**
   * The filters being applied to the dashboard. If the tile
   * is being configured as an explore this will not be populated.
   */
  dashboardFilters?: Filters
  /**
   * Indicates whether the dashboard is running. If the tile
   * is being configured as an explore the state will be UNKNOWN.
   * Note that for dashboard performance reasons, the runstate
   * may NEVER be shown as running. This generally will happen
   * if there no other tiles associated with a query (including
   * the one the extension is associated with).
   * If the extension needs to know for certain that a dashboard
   * has been run, detecting differences in the lastRunStartTime
   * is the reliable way.
   */
  dashboardRunState?: DashboardRunState
  /**
   * When true, the dashboard is being edited. If the tile
   * is being configured as an explore this will not be populated.
   */
  isDashboardEditing?: boolean
  /**
   * When true, cross filtering. If the tile
   * is being configured as an explore this will not be populated.
   */
  isDashboardCrossFilteringEnabled?: boolean
  /**
   * The id of the tile extension element that triggered the last
   * dashboard run. The id will be undefined if the dashboard run
   * was triggered by the dashboard run button or auto run or if
   * the run was triggered using the embed SDK. If the tile
   * is being configured as an explore this will not be populated.
   * Note that the lastRunSourceElementId CAN be the same as the
   * element id of the current extension instance, in other words,
   * if the extension triggers a dashboard run, it will be notified
   * when the dashboard run starts and finishes.
   */
  lastRunSourceElementId?: string
  /**
   * Indicates the last dashboard run start time. If the tile
   * is being configured as an explore this will not be populated.
   * Note that the start and end times reported should not
   * used for capturing performance metrics.
   */
  lastRunStartTime?: number
  /**
   * Indicates the last dashboard run end time. If the tile
   * is being configured as an explore this will not be populated.
   * If the tile is running, this will not be populated.
   * Note that the start and end times reported should not
   * used for capturing performance metrics.
   */
  lastRunEndTime?: number
  /**
   * Indicates whether the last dashboard run was succesful or not.
   * If the tile is being configured as an explore this will not be
   * populated.
   * If the tile is running, this will not be populated.
   */
  lastRunSuccess?: boolean
}

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

export interface CrossFilterOptions {
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
  tileHostData: TileHostData
  tileHostDataChanged: (hostData: Partial<TileHostData>) => void
  addErrors: (...errors: TileError[]) => void
  clearErrors: (group?: string) => void
  trigger: (
    message: string,
    config: TriggerConfig[],
    event?: MouseEvent
  ) => void
  openDrillMenu: (options: DrillMenuOptions, event?: MouseEvent) => void
  toggleCrossFilter: (options: CrossFilterOptions, event?: MouseEvent) => void
  runDashboard: () => void
  stopDashboard: () => void
  updateFilters: (filters: Filters, runDashboard?: boolean) => void
  openScheduleDialog: () => Promise<void>
}
