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
import { ExtensionSDK } from '@looker/extension-sdk'

export type UserPermission = 'delete' | 'create' | 'update'
/** This will probably need to change but it's a start at establishing user permissions for data operations */

export type UserRole = 'user' | 'staff' | 'judge' | 'admin'

export interface IHacker {
  /** Looker user object */
  user: IUser
  /** ID of the user */
  id: string
  /** Roles this user has */
  roles: Set<string>
  /** Permissions this user has */
  permissions: Set<string>
  /** is this user a staff member? */
  canStaff(): boolean
  /** is this user a judge? */
  canJudge(): boolean
  /** is this user an admin */
  canAdmin(): boolean
}

export class Hacker implements IHacker {
  roles = new Set<string>(['user'])
  permissions = new Set<string>()
  private static _configured = false
  private static _init(_extSDK: ExtensionSDK) {
    if (Hacker._configured) return Hacker._configured
    Hacker._configured = true
    return Hacker._configured
  }

  constructor(
    public readonly extSDK: ExtensionSDK,
    public readonly user: IUser
  ) {
    /** Initialize static cached values */
    Hacker._init(extSDK)
  }

  get id(): string {
    return this.user.id?.toString() || 'no id'
  }

  canAdmin(): boolean {
    return false
  }

  canJudge(): boolean {
    return false
  }

  canStaff(): boolean {
    return false
  }
}
