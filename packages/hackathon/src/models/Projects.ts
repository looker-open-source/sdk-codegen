/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import {
  ITabTable,
  noDate,
  RowValidationErrors,
  SheetError,
  SheetSDK,
  WhollySheet,
} from '@looker/wholly-sheet'

import { ISheetRow, SheetRow } from './SheetRow'
import { IHacker } from './Hacker'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IProject extends ISheetRow {
  _user_id: string
  _registration_id: string
  title: string
  description: string
  date_created: Date
  project_type: string
  contestant: boolean
  locked: boolean
  technologies: string[]
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Project extends SheetRow<Project> {
  _user_id = ''
  _registration_id = ''
  title = ''
  description = ''
  date_created: Date = noDate
  project_type = ''
  contestant = true
  locked = false
  technologies: string[] = []
  constructor(values?: any) {
    super()
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }

  canCreate(user: IHacker): boolean {
    return super.canCreate(user) || this._user_id === user.id
  }

  canDelete(user: IHacker): boolean {
    return super.canDelete(user) || this._user_id === user.id
  }

  canUpdate(user: IHacker): boolean {
    return super.canUpdate(user) || this._user_id === user.id
  }

  prepare(): Project {
    super.prepare()
    if (
      !this._user_id ||
      !this._registration_id ||
      this.technologies.length === 0
    )
      throw new SheetError(
        'User Id (for now), Registration Id, and Technologies must be assigned'
      )
    if (this.date_created === noDate) this.date_created = new Date()
    return this
  }

  validate() {
    const result: RowValidationErrors = {}
    if (!this._user_id) {
      result._user_id = {
        message: 'User ID (for now) must be assigned',
        type: 'error',
      }
    }
    if (!this._registration_id) {
      result._registration_id = {
        message: 'Registration ID must be assigned',
        type: 'error',
      }
    }
    if (this.technologies.length === 0) {
      result.technologies = {
        message: 'Technologies must be chosen',
        type: 'error',
      }
    }
    if (Object.keys(result).length === 0) return undefined
    return result
  }
}

export class Projects extends WhollySheet<Project> {
  constructor(
    public readonly sheets: SheetSDK,
    public readonly table: ITabTable
  ) {
    super(sheets, 'projects', table) //, { new Hackathon(values?: any)})
  }

  typeRow<Project>(values?: any) {
    return (new Project(values) as unknown) as Project
  }
}
