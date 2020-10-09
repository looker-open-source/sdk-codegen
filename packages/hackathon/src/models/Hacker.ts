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

import { IUser } from '@looker/sdk/lib/sdk/4.0/models'
import { Looker40SDK } from '@looker/sdk'

export type UserPermission = 'delete' | 'create' | 'update'
/** This will probably need to change but it's a start at establishing user permissions for data operations */

export type UserRole = 'user' | 'staff' | 'judge' | 'admin'

export interface IHacker {
  /** Looker user object */
  user: IUser
  /** ID of the user */
  id: string
  /** First name of user */
  firstName: string
  /** Last name of user */
  lastName: string
  /** Roles for this user */
  roles: Set<UserRole>
  /** Permissions for this user */
  permissions: Set<UserPermission>
  /** is this user a staff member? */
  canStaff(): boolean
  /** is this user a judge? */
  canJudge(): boolean
  /** is this user an admin? */
  canAdmin(): boolean
  /** assign the current user their roles and permissions from Looker user lookup */
  getMe(sdk: Looker40SDK): Promise<IHacker>
}

export class Hacker implements IHacker {
  user!: IUser
  roles = new Set<UserRole>(['user'])
  permissions = new Set<UserPermission>()

  constructor(public readonly sdk: Looker40SDK) {
    /** Initialize static cached values */
  }

  /**
   * Assigns the current looker user as the Hacker
   *
   * Because constructors cannot be async, the pattern to use is:
   *
   * const hacker = new Hacker(<Looker40SDK>)
   * await hacker.getMe()
   */
  async getMe() {
    this.user = await this.sdk.ok(this.sdk.me())
    const roles = await this.sdk.ok(this.sdk.all_roles({}))
    const staffRole = roles.find((r) => r.name?.match(/staff/i))
    const judgeRole = roles.find((r) => r.name?.match(/judge/i))
    const adminRole = roles.find((r) => r.name?.match(/admin/i))
    if (staffRole && this.user.role_ids?.includes(staffRole.id as number))
      this.roles.add('staff')
    if (judgeRole && this.user.role_ids?.includes(judgeRole.id as number))
      this.roles.add('judge')
    if (adminRole && this.user.role_ids?.includes(adminRole.id as number))
      this.roles.add('admin')
    return this
  }

  get id(): string {
    return this.user.id?.toString() || 'no id'
  }

  get firstName(): string {
    return this.user.first_name || 'no first name!'
  }

  get lastName(): string {
    return this.user.last_name || 'no first name!'
  }

  canAdmin(): boolean {
    return this.roles.has('admin')
  }

  canJudge(): boolean {
    return this.roles.has('judge') || this.canAdmin()
  }

  canStaff(): boolean {
    return this.roles.has('staff') || this.canAdmin()
  }
}
