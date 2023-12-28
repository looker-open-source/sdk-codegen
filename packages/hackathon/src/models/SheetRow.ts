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
import type { IRowModel } from '@looker/wholly-artifact';
import { RowModel } from '@looker/wholly-artifact';
import type { IHacker } from './Hacker';

export interface ISheetRow extends IRowModel {
  /** can the user create this row? */
  canCreate(user: IHacker): boolean;
  /** can the user update this row? */
  canUpdate(user: IHacker): boolean;
  /** can the user delete this row? */
  canDelete(user: IHacker): boolean;
}

export abstract class SheetRow<T extends ISheetRow> extends RowModel<T> {
  constructor(values?: any) {
    super(values);
  }

  canCreate(user: IHacker): boolean {
    return user.canAdmin || user.permissions.has('create');
  }

  canDelete(user: IHacker): boolean {
    return user.canAdmin || user.permissions.has('delete');
  }

  canUpdate(user: IHacker): boolean {
    return (
      user.canAdmin ||
      user.canStaff ||
      user.canJudge ||
      user.permissions.has('update')
    );
  }

  namespace() {
    return 'hackathon';
  }
}
