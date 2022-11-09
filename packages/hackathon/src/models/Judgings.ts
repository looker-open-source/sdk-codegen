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

import type { IRowModelProps, ITabTable } from '@looker/wholly-artifact'
import { WhollyArtifact } from '@looker/wholly-artifact'
import { getCore40SDK } from '@looker/extension-sdk-react'

import type { ISheetRow } from './SheetRow'
import { SheetRow } from './SheetRow'
import type { Project } from './Projects'
import type { User } from './Users'
import type { SheetData } from './SheetData'
import { getActiveSheet } from './SheetData'
import type { Hacker, IHacker } from './Hacker'
import type { Hackathon } from './Hackathons'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IJudgingProps extends IRowModelProps {
  user_id: string
  project_id: string
  execution: number
  ambition: number
  coolness: number
  impact: number
  score: number
  notes: string
  $title: string
  $description: string
  $project_type: string
  $contestant: boolean
  $technologies: string[]
  $judge_name: string
  $members: string[]
}
export interface IJudging extends IJudgingProps, ISheetRow {
  calculateScore(
    execution: number,
    ambition: number,
    coolness: number,
    impact: number
  ): number
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
  $title = ''
  $description = ''
  $judge_name = ''
  $project_type = ''
  $contestant = false
  $technologies: string[] = []
  $members: string[] = []

  constructor(values?: any) {
    super()
    // IMPORTANT: assign must be called AFTER super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }

  private data() {
    console.log('CALLED?')
    return getActiveSheet()
  }

  load(data?: SheetData) {
    if (!data) data = this.data()
    const u = data.users?.find(this.user_id) as User
    if (u) {
      this.$judge_name = u.$name
    }
    const p = data.projects?.find(this.project_id) as Project
    if (p) {
      this.$project_type = p.project_type
      this.$contestant = p.contestant
      this.$technologies = p.technologies
      this.$title = p.title
      this.$description = p.description
      this.$members = p.$members
    }
  }

  calculateScore(
    execution: number,
    ambition: number,
    coolness: number,
    impact: number
  ) {
    return 2 * execution + ambition + coolness + impact
  }

  canDelete(user: IHacker): boolean {
    return user.canAdmin || (user.canJudge && this.user_id === user.id)
  }

  canUpdate(user: IHacker): boolean {
    return user.canAdmin || (user.canJudge && this.user_id === user.id)
  }

  canCreate(user: IHacker): boolean {
    return user.canAdmin || (user.canJudge && this.user_id === user.id)
  }

  prepare(): IJudging {
    super.prepare()
    this.score = this.calculateScore(
      this.execution,
      this.ambition,
      this.coolness,
      this.impact
    )
    return this as unknown as IJudging
  }

  toObject(): IJudgingProps {
    this.load()
    return super.toObject() as IJudgingProps
  }
}

export class Judgings extends WhollyArtifact<Judging, IJudgingProps> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(getCore40SDK(), table)
  }

  typeRow<Judging>(values?: any) {
    const j = new Judging(values)
    j.load(this.data)
    return j as unknown as Judging
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
