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

import { ITabTable, SheetSDK, WhollySheet } from '@looker/wholly-sheet'
import { ISheetRow, SheetRow } from './SheetRow'
import { Project } from './Projects'
import { User } from './Users'
import { TeamMembers } from './TeamMembers'
import { SheetData } from './SheetData'
import { Hacker, IHacker } from './Hacker'
import { Hackathon } from './Hackathons'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IJudging extends ISheetRow {
  user_id: string
  project_id: string
  execution: number
  ambition: number
  coolness: number
  impact: number
  score: number
  notes: string
  $project: Project
  $title: string
  $judge: User
  $judge_name: string
  $team: TeamMembers[]
  $members: string[]
  $more_info: string
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Judging extends SheetRow<IJudging> {
  user_id = ''
  project_id = ''
  execution = 0
  ambition = 0
  coolness = 0
  impact = 0
  score = 0
  notes = ''
  $project: Project = {} as Project
  $judge: User = {} as User
  $data: SheetData = {} as SheetData

  constructor(values?: any) {
    super()
    // IMPORTANT: assign must be called AFTER super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }

  load(data?: SheetData) {
    if (data) this.$data = data
    const j = this.$data.users?.find(this.user_id)
    if (j) this.$judge = j
    const p = this.$data.projects?.find(this.project_id)
    if (p) this.$project = p
  }

  get $title() {
    return this.$project?.title || ''
  }

  get $team() {
    return this.$project.$team
  }

  get $members() {
    return this.$project.$members
  }

  get $judge_name() {
    return this.$judge.$name || ''
  }

  get $more_info() {
    return this.$project.more_info
  }

  canDelete(user: IHacker): boolean {
    return user.canAdmin() || (user.canJudge() && this.user_id === user.id)
  }

  canUpdate(user: IHacker): boolean {
    return user.canAdmin() || (user.canJudge() && this.user_id === user.id)
  }

  canCreate(user: IHacker): boolean {
    return user.canAdmin() || (user.canJudge() && this.user_id === user.id)
  }

  prepare(): IJudging {
    super.prepare()
    this.score =
      this.execution * 2 + this.ambition + this.coolness + this.impact
    return (this as unknown) as IJudging
  }
}

export class Judgings extends WhollySheet<Judging> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(data.sheetSDK ? data.sheetSDK : ({} as SheetSDK), 'judgings', table)
  }

  typeRow<Judging>(values?: any) {
    const j = new Judging(values)
    j.load(this.data)
    return (j as unknown) as Judging
  }

  filterBy(hackathon: Hackathon, hacker?: Hacker): Judging[] {
    const projects = this.data.projects.filterBy(hackathon)
    if (hacker) {
      return this.rows.filter(
        (j) =>
          j.user_id === hacker.id &&
          projects.find((p) => p._id === j.project_id)
      )
    }
    return this.rows.filter((j) => projects.find((p) => p._id === j.project_id))
  }
}
