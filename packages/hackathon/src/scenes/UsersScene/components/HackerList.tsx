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

import type { FC } from 'react';
import React from 'react';
import {
  DataTable,
  DataTableAction,
  DataTableCell,
  DataTableItem,
  Pagination,
} from '@looker/components';
import { Create } from '@styled-icons/material/Create';
import { useSelector } from 'react-redux';
import { getExtensionSDK } from '@looker/extension-sdk';
import type { IHackerProps } from '../../../models';
import { sheetCell } from '../../../models';
import { getHackersHeadings } from '../../../data/hack_session/selectors';
import { PAGE_SIZE } from '../../../constants';

interface HackerListProps {
  hackers: IHackerProps[];
  pageNum: number;
  updatePageNum: (pageNum: number) => void;
}

export const HackerList: FC<HackerListProps> = ({
  hackers,
  pageNum,
  updatePageNum,
}) => {
  const columns = useSelector(getHackersHeadings);

  const hackHacker = (hacker: IHackerProps) => {
    getExtensionSDK().openBrowserWindow(`/admin/users/${hacker.user.id}/edit`);
  };

  // Super hacky. Override the 'id' value, which is the User class id,
  // with the Looker user id
  // Have to do this because we want to show `Id` in the column header,
  // but actually show a different value.
  const userCell = (hacker: IHackerProps, columnName: string) => {
    if (columnName !== 'id') {
      return sheetCell(hacker[columnName]);
    } else {
      return sheetCell(hacker.user.id);
    }
  };

  const takeAction = (
    idx: number,
    columnName: string,
    hacker: IHackerProps
  ) => {
    const key = `${idx}.${columnName}`;
    return (
      <DataTableCell key={key}>{userCell(hacker, columnName)}</DataTableCell>
    );
  };

  const totalPages = Math.ceil(hackers.length / PAGE_SIZE);
  const startIdx = (pageNum - 1) * PAGE_SIZE;
  const rows = hackers
    .slice(startIdx, startIdx + PAGE_SIZE)
    .map((hacker, idx) => (
      <DataTableItem
        key={idx}
        id={idx.toString()}
        actions={
          <DataTableAction
            key={`${idx.toString() + '.click'}`}
            onClick={hackHacker.bind(null, hacker)}
            icon={<Create />}
          >
            Manage {hacker.name}
          </DataTableAction>
        }
      >
        {columns.map((column) => takeAction(idx, column.id, hacker))}
      </DataTableItem>
    ));

  return (
    <>
      <DataTable columns={columns} caption="List of hackerthon participants">
        {rows}
      </DataTable>
      <Pagination
        current={pageNum}
        pages={totalPages}
        onChange={updatePageNum}
      />
    </>
  );
};
