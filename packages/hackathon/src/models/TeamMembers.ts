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
import type { SheetData } from './SheetData'
import type { User } from './Users'

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface ITeamMemberProps extends IRowModelProps {
  user_id: string
  project_id: string
  responsibilities: string
  /** Associated user record */
  $user: User
  /** Calculated property for user */
  $name: string
}

export interface ITeamMember extends ITeamMemberProps, ISheetRow {}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class TeamMember extends SheetRow<ITeamMember> {
  user_id = ''
  project_id = ''
  responsibilities = ''
  $user!: User

  constructor(values?: any) {
    super()
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }

  get $name() {
    if (!this.$user) {
      throw new Error(`$user is not assigned for user_id ${this.user_id}`)
    }
    return `${this.$user.first_name} ${this.$user.last_name}`
  }

  toObject(): ITeamMemberProps {
    return super.toObject() as ITeamMemberProps
  }

  namespace() {
    return 'team_members'
  }
}

export class TeamMembers extends WhollyArtifact<TeamMember, ITeamMemberProps> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(getCore40SDK(), table)
  }

  typeRow<TeamMember>(values?: any) {
    const member = new TeamMember(values)
    const user = this.data?.users.find(member.user_id)
    if (user) member.$user = user
    return member as unknown as TeamMember
  }
}
