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
import { SheetSDK, ISheet, compareDates } from '@looker/wholly-sheet'
import {
  Projects,
  Registrations,
  Technologies,
  ProjectTechnologies,
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
  private _hackathon: Hackathon | undefined
  protected _sheet!: ISheet
  users!: Users
  projects!: Projects
  technologies!: Technologies
  registrations!: Registrations
  projectTechnologies!: ProjectTechnologies
  hackathons!: Hackathons
  teamMembers!: TeamMembers
  judgings!: Judgings

  constructor(public readonly sheetSDK: SheetSDK, data: ISheet) {
    this.sheet = data
  }

  /** finds the "next up" or "current" hackathon and caches it for the instance lifetime */
  get currentHackathon(): Hackathon | undefined {
    if (this._hackathon) return this._hackathon
    if (
      !this.hackathons ||
      !this.hackathons.rows ||
      this.hackathons.rows.length === 0
    )
      return undefined
    // Sort hackathons in chronological order by start time ... maybe we sort by the stop of judging instead?
    const sorted = this.hackathons.rows.sort((a, b) =>
      compareDates(a.date, b.date)
    )
    const now = new Date().getTime()
    const current = sorted.find((hack) => hack.judging_stops.getTime() >= now)
    this._hackathon = current as Hackathon
    return this._hackathon
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
    if (Object.keys(data).length === 0) return this
    this.users = new Users(this, data.tabs.users)
    this.registrations = new Registrations(this, data.tabs.registrations)
    this.technologies = new Technologies(this, data.tabs.technologies)
    this.projects = new Projects(this, data.tabs.projects)
    this.projectTechnologies = new ProjectTechnologies(
      this,
      data.tabs.project_technologies
    )
    this.hackathons = new Hackathons(this, data.tabs.hackathons)
    this.teamMembers = new TeamMembers(this, data.tabs.team_members)
    this.judgings = new Judgings(this, data.tabs.judgings)
    return this
  }

  async refresh() {
    const data = await this.sheetSDK.index()
    this.load(data)
    return this
  }
}
