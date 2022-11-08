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

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IUserProps extends IRowModelProps {
  first_name: string
  last_name: string
  $name: string
}

export interface IUser extends ISheetRow, IUserProps {}

/**
 * This is a row from the sheet's users table
 *
 * Because a "Hacker" cannot load the list of users, this is used to resolve user names needed by
 * other parts of the UI.
 *
 * This user record is created on demand when registering "attendance" when opening the Hackathon app
 *
 */
export class User extends SheetRow<IUser> {
  first_name = ''
  last_name = ''
  constructor(values?: any) {
    super()
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values)
  }

  get $name(): string {
    return `${this.first_name} ${this.last_name}`
  }

  toObject(): IUserProps {
    return super.toObject() as IUserProps
  }

  namespace() {
    return 'users'
  }
}

export class Users extends WhollyArtifact<User, IUserProps> {
  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(getCore40SDK(), table)
  }

  typeRow<User>(values?: any) {
    return new User(values) as unknown as User
  }
}
