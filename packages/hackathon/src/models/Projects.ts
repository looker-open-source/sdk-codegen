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
  IRowModel,
  ITabTable,
  noDate,
  RowValidationErrors,
  SheetError,
  SheetSDK,
  WhollySheet,
} from '@looker/wholly-sheet'

import { ISheetRow, SheetRow } from './SheetRow'
import { Hacker, IHacker } from './Hacker'
import { Hackathon } from './Hackathons'
import { SheetData } from './SheetData'
import { TeamMember } from './TeamMembers'
import { Judging } from './Judgings'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IProject extends ISheetRow {
  _user_id: string
  _hackathon_id: string
  title: string
  description: string
  date_created: Date
  project_type: string
  contestant: boolean
  locked: boolean
  more_info: string
  technologies: string[]
  $team: TeamMember[]
  findMember(hacker: Hacker): TeamMember | undefined
  findJudging(hacker: Hacker): Judging | undefined
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Project extends SheetRow<Project> {
  _user_id = ''
  _hackathon_id = ''
  title = ''
  description = ''
  date_created: Date = noDate
  project_type = ''
  contestant = true
  locked = false
  more_info = ''
  technologies: string[] = []
  $team: TeamMember[] = []
  $judgings: Judging[] = []

  constructor(values?: any) {
    super()
    // IMPORTANT: assign must be called after the super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but that pattern hasn't been found
    this.assign(values)
  }

  canCreate(user: IHacker): boolean {
    return super.canCreate(user) || this._user_id === user.id
  }

  canDelete(user: IHacker): boolean {
    return (
      super.canDelete(user) ||
      (this._user_id === user.id && this.$team.length === 0)
    )
  }

  canUpdate(user: IHacker): boolean {
    return super.canUpdate(user) || this._user_id === user.id
  }

  prepare(): Project {
    super.prepare()
    const errors = this.validate()
    if (errors)
      throw new SheetError(
        Object.values(errors)
          .map((v) => v.message)
          .join()
      )
    if (this.date_created === noDate) this.date_created = new Date()
    return this
  }

  validate() {
    const result: RowValidationErrors = {}
    if (!this._user_id) {
      result._user_id = {
        message: 'User ID must be assigned',
        type: 'error',
      }
    }
    if (!this._hackathon_id) {
      result._hackathon_id = {
        message: 'Hackathon ID must be assigned',
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

  findMember(hacker: Hacker) {
    return this.$team.find((m) => m.user_id === hacker.id)
  }

  findJudging(hacker: Hacker) {
    return this.$judgings.find((j) => j.user_id === hacker.id)
  }
}

export class Projects extends WhollySheet<Project> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(data.sheetSDK ? data.sheetSDK : ({} as SheetSDK), 'projects', table)
    this.rows.forEach((project) => this.getMembers(project))
  }

  typeRow<Project>(values?: any) {
    const project = new Project(values)
    // this.getMembers(project)
    return (project as unknown) as Project
  }

  /**
   * Filter projects by hackathon and/or user
   * @param hackathon to filter by
   * @param user to filter by
   */
  filterBy(hackathon?: Hackathon, user?: Hacker) {
    if (hackathon && user)
      return this.rows.filter(
        (p) => p._user_id === user.id && p._hackathon_id === hackathon._id
      )
    if (hackathon)
      return this.rows.filter((p) => p._hackathon_id === hackathon._id)
    if (user) return this.rows.filter((p) => p._user_id === user.id)
    return this.rows
  }

  getMembers(project: Project): Project {
    project.$team = this.data.teamMembers.rows.filter(
      (m) => m.project_id === project._id
    )
    return project
  }

  getJudgings(project: Project): Project {
    project.$judgings = this.data.judgings.rows.filter(
      (m) => m.project_id === project._id
    )
    return project
  }

  /**
   * Locks or unlocks all projects for a hackathon
   * @param hackathon
   * @param locked true to lock, false to unlock
   */
  async lock(hackathon: Hackathon, locked: boolean) {
    await this.refresh()
    const projects = this.filterBy(hackathon)
    for (const project of projects) {
      project.locked = locked
      await this.update(project, true)
    }
    return projects
  }

  /** Join a project team if slots are available */
  async join(project: Project, hacker: Hacker) {
    const hackathon = this.data.hackathons.find(project._hackathon_id)
    if (!hackathon)
      throw new SheetError(`Hackathon ${project._hackathon_id} was not found`)
    if (project.$team.length >= hackathon.max_team_size)
      throw new SheetError(
        `Hackathon ${hackathon.name} only allows ${hackathon.max_team_size} team members per project`
      )
    let member = project.findMember(hacker)
    /** already in the project, nothing to do */
    if (member) return project
    member = new TeamMember({ user_id: hacker.id, project_id: project._id })
    await this.data.teamMembers.save(member)
    // Reload because maybe there's another different member now
    this.getMembers(project)
    return project
  }

  /** Leave a project if on the team */
  async leave(project: Project, hacker: Hacker) {
    const member = project.findMember(hacker)
    if (!member) return project // nothing to do
    await this.data.teamMembers.delete(member)
    // Reload because maybe there's another different member now
    this.getMembers(project)

    return project
  }

  async addJudge(project: Project, hacker: Hacker) {
    if (!hacker.canJudge())
      throw new SheetError(`${hacker.name} is not a judge`)
    if (project.$judgings.find((j) => j.user_id === hacker.id)) return project
    const judging = new Judging({ user_id: hacker.id, project_id: project._id })
    await this.data.judgings.save(judging)
    this.getJudgings(project)
    return project
  }

  async deleteJudge(project: Project, hacker: Hacker) {
    const judging = project.findJudging(hacker)
    if (!judging) return project
    await this.data.judgings.delete(judging)
    this.getJudgings(project)
    return project
  }

  async delete<T extends IRowModel>(model: T) {
    if (await super.delete(model)) {
      const team = Array.from(model.$team).reverse() as TeamMember[]
      for (const member of team) {
        // Delete last row first
        await this.data.teamMembers.delete(member)
      }
      const judging = Array.from(model.$judgings).reverse() as Judging[]
      for (const j of judging) {
        // Delete last row first
        await this.data.judgings.delete(j)
      }
    }
    return true
  }
}
