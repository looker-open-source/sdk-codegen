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

import { IRole, IUser as ILookerUser } from '@looker/sdk/lib/4.0/models'
import { Looker40SDK } from '@looker/sdk/lib/browser'
import { SheetError, TypedRows } from '@looker/wholly-sheet'
import { SheetData, Registration, Hackathon } from '.'

export type UserPermission = 'delete' | 'create' | 'update'
/** This will probably need to change but it's a start at establishing user permissions for data operations */

export type UserRole = 'user' | 'staff' | 'judge' | 'admin'

export interface IHackerProps {
  /** Looker user object */
  user: ILookerUser
  /** ID of the user */
  id: string
  /** First name of user */
  firstName: string
  /** Last name of user */
  lastName: string
  /** Full name of user */
  name: string
  /** Roles for this user */
  roles: Set<UserRole>
  /** Permissions for this user */
  permissions: Set<UserPermission>
  /** virtual property for registration date */
  registered: Date | undefined
  /** virtual property for attended */
  attended: boolean
  /** Does the hacker have API3 credentials */
  api3: boolean
  /** user registration record */
  registration: Registration
  /** is this user a staff member? */
  canStaff: boolean
  /** is this user a judge? */
  canJudge: boolean
  /** is this user an admin? */
  canAdmin: boolean
  /** assign the current user their roles and permissions from Looker user lookup */
}

export interface IHacker extends IHackerProps {
  getMe(): Promise<IHacker>
}

/**
 * Hacker represents the active Hackathon user.
 *
 * It is a merge of their Looker user information with their hackathon registration
 *
 * The User object from the sheet is used to avoid rights issues getting all users as a normal Hacker
 */
export class Hacker implements IHacker {
  user: ILookerUser = { id: 0, first_name: 'Unknown', last_name: 'user!' }
  roles = new Set<UserRole>(['user'])
  permissions = new Set<UserPermission>()
  api3 = false
  registration!: Registration
  canAdmin = false
  canJudge = false
  canStaff = false

  constructor(public readonly sdk?: Looker40SDK, user?: ILookerUser) {
    if (user) {
      this.user = user
      if (
        user.credentials_api3 &&
        user.credentials_api3.find((c) => !c.is_disabled)
      )
        this.api3 = true
    }
  }

  get name() {
    return `${this.firstName} ${this.lastName}`
  }

  protected staffRole?: IRole
  protected judgeRole?: IRole
  protected adminRole?: IRole

  protected async getRoles(sdk: Looker40SDK, userId: string): Promise<void> {
    try {
      const roles = await sdk.ok(
        sdk.user_roles({ user_id: parseInt(userId, 10) })
      )
      this.staffRole = roles.find((r: IRole) =>
        r.name?.match(/hackathon staff/i)
      )
      this.judgeRole = roles.find((r: IRole) =>
        r.name?.match(/hackathon judge/i)
      )
      this.adminRole = roles.find((r: IRole) => r.name?.match(/admin/i))
    } catch (error) {
      // user doesn't have roles, so the user role will default to 'user' only
    }
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
        await this.getRoles(this.sdk, this.id)
        if (this.staffRole) this.roles.add('staff')
        if (this.judgeRole) this.roles.add('judge')
        if (this.adminRole) this.roles.add('admin')
      } catch (err) {
        if (err.message !== 'Not found') {
          throw err
        }
      }
    }
    this.assignRights()
    return this
  }

  assignRights() {
    this.canAdmin = this.roles.has('admin')
    this.canJudge = this.roles.has('judge')
    this.canStaff = this.roles.has('staff') || this.canAdmin
  }

  findRegistration(hackathon: Hackathon, registrations: Registration[]) {
    const reg = registrations.find(
      (r: Registration) =>
        r._user_id === this.id && r.hackathon_id === hackathon._id
    )
    if (reg) this.registration = reg
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

  toObject(): IHackerProps {
    return { ...this } as IHackerProps
  }
}

export class Hackers extends TypedRows<Hacker> {
  judges!: Hacker[]
  users!: Hacker[]
  staff!: Hacker[]
  admins!: Hacker[]

  constructor(public sdk: Looker40SDK, users?: ILookerUser[]) {
    super([])
    if (users) this.assign(users)
  }

  get displayHeaders() {
    return [
      'id',
      'name',
      'roles',
      // 'permissions',
      'registered',
      'api3',
      'attended',
    ]
  }

  assign(users: ILookerUser[]) {
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
      })
    )
  }

  private loadGroups() {
    this.users = this.rows.filter(
      (h) => !(h.canJudge || h.canStaff || h.canAdmin)
    )
    this.staff = this.rows.filter((h) => h.canStaff)
    this.judges = this.rows.filter((h) => h.canJudge)
    this.admins = this.rows.filter((h) => h.canAdmin)
  }

  /**
   * Load all hackers, assign their roles and registration record
   * @param data all loaded tabs
   * @param hackers to load. If not specified, the hackers for the currentHackathon will be loaded
   */
  async load(data: SheetData, hackers?: ILookerUser[]) {
    const hackathon = data.currentHackathon
    if (!hackathon) throw new Error(`No current hackathon was found`)
    if (!hackers && this.rows.length === 0) {
      this.assign(await this.findHackUsers(hackathon))
    } else if (hackers) {
      this.assign(hackers)
    }
    const regs = data.registrations.rows.filter(
      (r) => r.hackathon_id === hackathon._id
    )
    const { admins, staff, judges } = await this.getSpecialUsers()
    for (const hacker of this.rows) {
      if (admins.includes(hacker.id)) {
        hacker.roles.add('admin')
        hacker.canAdmin = true
      }
      if (staff.includes(hacker.id)) {
        hacker.roles.add('staff')
        hacker.canStaff = true
      }
      if (judges.includes(hacker.id)) {
        hacker.roles.add('judge')
        hacker.canJudge = true
      }
      hacker.findRegistration(hackathon, regs)
    }
    this.loadGroups()
    return this
  }

  private async getSpecialUsers() {
    let judges: string[] = []
    let staff: string[] = []
    let admins: string[] = []
    try {
      const roles = await this.sdk.ok(this.sdk.all_roles({ fields: 'name,id' }))
      const adminRole = roles.find((r: IRole) => r.name?.match(/admin/i))
      if (adminRole) {
        const users = await this.sdk.ok(
          this.sdk.role_users({ fields: 'id', role_id: adminRole.id! })
        )
        admins = users.map((user) => user.id?.toString() || 'no id')
      }
      const judgeRole = roles.find((r: IRole) =>
        r.name?.match(/hackathon judge/i)
      )
      if (judgeRole) {
        const users = await this.sdk.ok(
          this.sdk.role_users({ fields: 'id', role_id: judgeRole.id! })
        )
        judges = users.map((user) => user.id?.toString() || 'no id')
      }
      const staffRole = roles.find((r: IRole) =>
        r.name?.match(/hackathon staff/i)
      )
      if (staffRole) {
        const users = await this.sdk.ok(
          this.sdk.role_users({ fields: 'id', role_id: staffRole.id! })
        )
        staff = users.map((user) => user.id?.toString() || 'no id')
      }
    } catch (err) {
      // Likely caused by permission access failure for regular user who
      // does not have access to all roles or role users apis.
      // It's okay to eat as regular user does not need information about
      // other users.
    }
    return { admins, judges, staff }
  }
}
