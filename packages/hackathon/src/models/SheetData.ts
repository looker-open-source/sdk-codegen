/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import type { SheetSDK, ISheet } from '@looker/wholly-sheet'
import type { Hackathon, Hacker } from '.'
import {
  Projects,
  Registrations,
  Technologies,
  Hackathons,
  TeamMembers,
  Judgings,
  Registration,
  Users,
  User,
} from '.'

export class SheetData {
  protected _sheet!: ISheet
  users!: Users
  projects!: Projects
  technologies!: Technologies
  registrations!: Registrations
  hackathons!: Hackathons
  teamMembers!: TeamMembers
  judgings!: Judgings

  constructor(public readonly sheetSDK: SheetSDK, data: ISheet) {
    this.sheet = data
  }

  get currentHackathon() {
    return this.hackathons.currentHackathon
  }

  get sheet() {
    return this._sheet
  }

  /**
   * Assigning the sheet assigns the typed collections
   * @param value
   */
  set sheet(value: ISheet) {
    this.load(value)
  }

  /**
   * Loads the sheet into typed collections
   * @param data entire sheet to load
   */
  load(data: ISheet) {
    this._sheet = data
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    _activeSheet = this
    if (Object.keys(data).length === 0) return this
    // The initialization order is significant here, and should remain this way
    // unless there's a specific reason to change it
    this.users = new Users(this, data.tabs.users)
    this.registrations = new Registrations(this, data.tabs.registrations)
    this.technologies = new Technologies(this, data.tabs.technologies)
    this.hackathons = new Hackathons(this, data.tabs.hackathons)
    this.teamMembers = new TeamMembers(this, data.tabs.team_members)
    this.judgings = new Judgings(this, data.tabs.judgings)
    this.projects = new Projects(this, data.tabs.projects)
    this.projects.rows.forEach((p) => p.load(this))
    this.judgings.rows.forEach((j) => j.load(this))
    return this
  }
}

let _activeSheet: SheetData

/** Initialize the globally available sheet */
export const initActiveSheet = (
  sheetSDK: SheetSDK,
  data: ISheet
): SheetData => {
  _activeSheet = new SheetData(sheetSDK, data)
  return _activeSheet
}

/** Get the globally available sheet */
export const getActiveSheet = (): SheetData => _activeSheet
