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
import { SheetSDK, ISheet } from '@looker/wholly-sheet'
import {
  Projects,
  Registrations,
  Technologies,
  Hackathons,
  TeamMembers,
  Judgings,
  Hackathon,
  Hacker,
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

  /**
   * Optionally create and get registration and user record for user in Hackathon
   * @param hackathon to register
   * @param hacker to register
   */
  async registerUser(
    hackathon: Hackathon,
    hacker: Hacker
  ): Promise<Registration> {
    let reg = this.registrations.rows.find(
      (r) => r._user_id === hacker.id && r.hackathon_id === hackathon._id
    )
    let user = this.users.find(hacker.id)
    if (!user) {
      /** create the user tab row for this hacker */
      user = new User({
        _id: hacker.id,
        first_name: hacker.firstName,
        last_name: hacker.lastName,
      })
      await this.users.save(user)
    } else {
      if (
        user.first_name !== hacker.firstName ||
        user.last_name !== hacker.lastName
      ) {
        // Refresh the user's name
        user.first_name = hacker.firstName
        user.last_name = hacker.lastName
        await this.users.save(user)
      }
    }
    if (reg) {
      hacker.registration = reg
      return reg
    }
    reg = new Registration({ _user_id: hacker.id, hackathon_id: hackathon._id })
    reg = await this.registrations.save(reg)
    return reg
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

  async refresh() {
    const data = await this.sheetSDK.index()
    this.load(data)
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
