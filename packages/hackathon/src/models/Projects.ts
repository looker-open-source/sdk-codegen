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

import type {
  IRowModel,
  IRowModelProps,
  ITabTable,
  RowValidationErrors,
} from '@looker/wholly-artifact'
import { noDate, WhollyArtifact } from '@looker/wholly-artifact'
import { getCore40SDK } from '@looker/extension-sdk-react'

import type { ISheetRow } from './SheetRow'
import { SheetRow } from './SheetRow'
import type { Hacker, IHacker } from './Hacker'
import type { Hackathon, IHackathonProps } from './Hackathons'
import type { SheetData } from './SheetData'
import { getActiveSheet } from './SheetData'
import type { ITeamMemberProps } from './TeamMembers'
import { TeamMember } from './TeamMembers'
import type { IJudgingProps } from './Judgings'
import { Judging } from './Judgings'
import type { ITechnologyProps } from './Technologies'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IProjectProps extends IRowModelProps {
  _user_id: string
  _hackathon_id: string
  title: string
  description: string
  date_created: Date
  project_type: string
  contestant: boolean
  locked: boolean
  more_info: string
  // TODO: Change technologies -> tech_ids and $techs -> $tech_names
  // to be more descriptive and less confusing
  technologies: string[] // Key TODO: Cl
  $techs: string[] // Name/Description
  $team: ITeamMemberProps[]
  $judgings: IJudgingProps[]
  $hackathon: IHackathonProps
  $members: string[]
  $judges: string[]
  $team_count: number
  $judge_count: number
}

export interface IProject extends IProjectProps, ISheetRow {
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
  technologies: string[] = [] // Key
  $techs: string[] = [] // Description/name of tech
  $team: ITeamMemberProps[] = []
  $judgings: IJudgingProps[] = []
  $hackathon!: IHackathonProps

  constructor(values?: any) {
    super()
    // IMPORTANT: assign must be called after the super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but that pattern hasn't been found
    this.assign(values)
  }

  get $team_count() {
    return `${this.$team.length}/${this.$hackathon?.max_team_size || 5}`
  }

  get $judge_count() {
    return this.$judgings.length
  }

  get $members(): string[] {
    const names: string[] = []
    this.$team.forEach((m) => {
      const user = this.data().users.find(m.user_id)
      if (user) names.push(`${user.first_name} ${user.last_name}`)
    })
    return names
  }

  get $judges(): string[] {
    const names: string[] = []
    this.$judgings.forEach((j) => {
      const user = this.data().users.find(j.user_id)
      if (user) names.push(`${user.first_name} ${user.last_name}`)
    })
    return names
  }

  data(): SheetData {
    return getActiveSheet()
  }

  toObject(): IProjectProps {
    this.load()
    return super.toObject() as IProjectProps
  }

  canCreate(user: IHacker): boolean {
    return (
      super.canCreate(user) ||
      (this._user_id === user.id && this.$hackathon?.isActive())
    )
  }

  canDelete(user: IHacker): boolean {
    return (
      super.canDelete(user) ||
      (this._user_id === user.id &&
        this.$team.length === 0 &&
        this.$hackathon?.isActive())
    )
  }

  canUpdate(user: IHacker): boolean {
    return (
      super.canUpdate(user) ||
      (this._user_id === user.id && this.$hackathon?.isActive())
    )
  }

  prepare(): Project {
    super.prepare()
    const errors = this.validate()
    if (errors)
      throw new Error(
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
    const found = this.$team.find((m) => m.user_id === hacker.id)
    return found ? new TeamMember(found) : found
  }

  findJudging(hacker: Hacker) {
    const found = this.$judgings.find((j) => j.user_id === hacker.id)
    return found ? new Judging(found) : undefined
  }

  load(data?: SheetData) {
    if (!data) data = this.data()
    this.getJudgings()
    this.getMembers()
    this.getTechs()
    const found = data.hackathons?.find(this._hackathon_id)
    if (found) this.$hackathon = found
    return this
  }

  getMembers(): Project {
    this.$team = this.data().teamMembers?.rows.filter(
      (m) => m.project_id === this._id
    )
    return this
  }

  getJudgings(): Project {
    const data = this.data()
    this.$judgings = data.judgings?.rows.filter(
      (m) => m.project_id === this._id
    )
    this.$judgings.forEach((j) => {
      // Assign relations back for judging row in case it's not established
      j.load(data)
    })
    return this
  }

  getTechs(): Project {
    const techs: string[] = []
    this.technologies.forEach((key) => {
      const tech = this.data().technologies.find(key)
      if (!tech) {
        throw new Error(
          `Project's technology's key is not in technology table. tech key: ` +
            key +
            ' project: ' +
            this.key
        )
      }
      techs.push(tech.description)
    })
    this.$techs = techs
    return this
  }

  /** Join a project team if slots are available */
  async join(hacker: Hacker) {
    const data = this.data()
    const hackathon = data.hackathons?.find(this._hackathon_id)
    if (!hackathon)
      throw new Error(`Hackathon ${this._hackathon_id} was not found`)
    if (this.$team.length >= hackathon.max_team_size)
      throw new Error(
        `Hackathon ${hackathon.name} only allows ${hackathon.max_team_size} team members per project`
      )
    let member = this.findMember(hacker)
    /** already in the project, nothing to do */
    if (member) return this
    member = new TeamMember({ user_id: hacker.id, project_id: this._id })
    await data.teamMembers.save(member)
    // Reload because maybe there's another different member now
    this.getMembers()
    return this
  }

  /** Leave a project if on the team */
  async leave(hacker: Hacker) {
    const member = this.findMember(hacker)
    if (!member) return this // nothing to do
    await this.data().teamMembers.delete(member)
    // Reload because maybe there's another different member now
    this.getMembers()

    return this
  }

  async addJudge(hacker: Hacker) {
    if (!hacker.canJudge) throw new Error(`${hacker.name} is not a judge`)
    if (this.findJudging(hacker)) return this
    const judging = new Judging({ user_id: hacker.id, project_id: this._id })
    await this.data().judgings.save(judging)
    this.getJudgings()
    return this
  }

  async deleteJudge(hacker: Hacker) {
    const judging = this.findJudging(hacker)
    if (!judging) return this
    await this.data().judgings.delete(judging)
    this.getJudgings()
    return this
  }
}

export class Projects extends WhollyArtifact<Project, IProjectProps> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(getCore40SDK(), table)
  }

  typeRow<Project>(values?: any) {
    const project = new Project(values)
    // this.getMembers(project)
    return project as unknown as Project
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

  async delete<T extends IRowModel>(model: T, force = false) {
    if (await super.delete(model, force)) {
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

  async save<T extends IRowModel>(model: T, force = false): Promise<T> {
    const project = await super.save(model, force)
    project.load(this.data)
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
      project.setUpdate()
    }
    await this.batchUpdate(true)
    return projects
  }
}
