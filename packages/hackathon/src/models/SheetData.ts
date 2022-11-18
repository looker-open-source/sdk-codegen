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
import {
  Projects,
  Registrations,
  Technologies,
  Hackathons,
  TeamMembers,
  Judgings,
  Users,
} from '.'

export class SheetData {
  users!: Users
  projects!: Projects
  technologies!: Technologies
  registrations!: Registrations
  hackathons!: Hackathons
  teamMembers!: TeamMembers
  judgings!: Judgings

  get currentHackathon() {
    return this.hackathons.currentHackathon
  }

  async init() {
    // Not ideal, should load all data and then instantiate each WhollyArtifact in correct order. Right now depends on refresh() to fetch data. The order of table loads is important.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.users = new Users(this, {
      header: ['_id', '_updated', 'first_name', 'last_name'],
      rows: [],
    })
    await this.users.refresh()
    this.registrations = new Registrations(this, {
      header: [
        '_id',
        '_updated',
        '_user_id',
        'hackathon_id',
        'date_registered',
        'attended',
      ],
      rows: [],
    })
    await this.registrations.refresh()
    this.technologies = new Technologies(this, {
      header: ['_id', '_updated', 'description'],
      rows: [],
    })
    await this.technologies.refresh()
    this.hackathons = new Hackathons(this, {
      header: [
        '_id',
        '_updated',
        'name',
        'description',
        'location',
        'date',
        'duration_in_days',
        'max_team_size',
        'judging_starts',
        'judging_stops',
        'default',
      ],
      rows: [],
    })
    await this.hackathons.refresh()
    this.teamMembers = new TeamMembers(this, {
      header: ['_id', '_updated', 'user_id', 'project_id', 'responsibilities'],
      rows: [],
    })
    await this.teamMembers.refresh()
    this.judgings = new Judgings(this, {
      header: [
        '_id',
        '_updated',
        'user_id',
        'project_id',
        'execution',
        'ambition',
        'coolness',
        'impact',
        'score',
        'notes',
      ],
      rows: [],
    })
    await this.judgings.refresh()
    this.projects = new Projects(this, {
      header: [
        '_id',
        '_updated',
        '_user_id',
        '_hackathon_id',
        'title',
        'description',
        'date_created',
        'project_type',
        'contestant',
        'locked',
        'more_info',
        'technologies',
      ],
      rows: [],
    })
    await this.projects.refresh()
    this.projects.rows.forEach((p) => p.load(this))
    this.judgings.rows.forEach((j) => j.load(this))
    return this
  }
}

let _activeSheet: SheetData

/** Initialize the globally available sheet */
export const initActiveSheet = (sheetData: SheetData): SheetData => {
  _activeSheet = sheetData
  return _activeSheet
}

/** Get the globally available sheet */
export const getActiveSheet = (): SheetData => _activeSheet
