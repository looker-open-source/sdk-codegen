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

import { IRole, IUser } from '@looker/sdk/lib/sdk/4.0/models'
import { Looker40SDK } from '@looker/sdk/lib/browser'
import { SheetError, TypedRows } from '@looker/wholly-sheet'
import { SheetData, Registrations, Registration, Hackathon } from '.'

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
  /** virtual property for registration date */
  registered: Date | undefined
  /** virtual property for attended */
  attended: boolean

  /** is this user a staff member? */
  canStaff(): boolean
  /** is this user a judge? */
  canJudge(): boolean
  /** is this user an admin? */
  canAdmin(): boolean
  /** assign the current user their roles and permissions from Looker user lookup */
  getMe(): Promise<IHacker>
}

export class Hacker implements IHacker {
  user: IUser = { id: 0, first_name: 'Unknown', last_name: 'user!' }
  roles = new Set<UserRole>(['user'])
  permissions = new Set<UserPermission>()
  registration?: Registration

  constructor(public readonly sdk?: Looker40SDK, user?: IUser) {
    if (user) {
      this.user = user
    }
  }

  /** Initialize static cached values */
  protected static staffRole?: IRole
  protected static judgeRole?: IRole
  protected static adminRole?: IRole

  protected static async getRoles(sdk: Looker40SDK): Promise<void> {
    if (this.staffRole && this.judgeRole && this.adminRole) return

    const roles = await sdk.ok(sdk.all_roles({}))
    this.staffRole = roles.find((r) => r.name?.match(/hackathon staff/i))
    this.judgeRole = roles.find((r) => r.name?.match(/hackathon judge/i))
    this.adminRole = roles.find((r) => r.name?.match(/admin/i))
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
    if (this.sdk) {
      this.user = await this.sdk.ok(this.sdk.me())
      return await this.assignRoles()
    }
    return this
  }

  async assignRoles() {
    if (this.sdk) {
      try {
        await Hacker.getRoles(this.sdk)
        if (
          Hacker.staffRole &&
          this.user.role_ids?.includes(Hacker.staffRole.id as number)
        )
          this.roles.add('staff')
        if (
          Hacker.judgeRole &&
          this.user.role_ids?.includes(Hacker.judgeRole.id as number)
        )
          this.roles.add('judge')
        if (
          Hacker.adminRole &&
          this.user.role_ids?.includes(Hacker.adminRole.id as number)
        )
          this.roles.add('admin')
      } catch (err) {
        if (err.message !== 'Not found') {
          throw err
        }
      }
    }
    return this
  }

  findRegistration(hackathon: Hackathon, registrations: Registrations) {
    this.registration = registrations.find(
      (r: Registration) =>
        r._user_id === this.id && r.hackathon_id === hackathon._id
    )
  }

  get id(): string {
    return this.user.id?.toString() || 'no id'
  }

  get firstName(): string {
    return this.user.first_name || 'Unknown'
  }

  get lastName(): string {
    return this.user.last_name || 'user!'
  }

  get registered(): Date | undefined {
    if (this.registration) return this.registration.date_registered
    return undefined
  }

  get attended(): boolean {
    if (this.registration) return this.registration.attended
    return false
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

export class Hackers extends TypedRows<Hacker> {
  constructor(public sdk: Looker40SDK, users?: IUser[]) {
    super([])
    if (users) this.assign(users)
  }

  get displayHeaders() {
    return [
      'id',
      'firstName',
      'lastName',
      'roles',
      'permissions',
      'registered',
      'attended',
    ]
  }

  assign(users: IUser[]) {
    this.rows = users.map((u) => new Hacker(this.sdk, u))
    return this
  }

  /**
   * Finds all users for a hackathon group based on the hackathon's id
   * @param hackathon
   */
  async findHackUsers(hackathon: Hackathon) {
    const groupName = `Looker_Hack: ${hackathon._id}`
    // const groupName = `Hackathon`
    const groups = await this.sdk.ok(
      this.sdk.search_groups({ name: groupName })
    )
    if (!groups || groups.length === 0)
      throw new SheetError(`Group ${groupName} was not found`)
    const group = groups[0]
    return await this.sdk.ok(
      this.sdk.search_users({
        group_id: group.id?.toString(),
        fields: 'id,first_name,last_name',
      })
    )
  }

  /**
   * Load all hackers, assign their roles and registration record
   * @param data all loaded tabs
   * @param users to load. If not specified, the users for the currentHackathon will be loaded
   */
  async load(data: SheetData, users?: IUser[]) {
    const hackathon = data.currentHackathon
    if (!hackathon) throw new Error(`No current hackathon was found`)
    if (!users && this.rows.length === 0) {
      this.assign(await this.findHackUsers(hackathon))
    } else if (users) {
      this.assign(users)
    }
    const regs = data.registrations
    for (const user of this.rows) {
      await user.assignRoles()
      user.findRegistration(hackathon, regs)
    }
    return this
  }
}
