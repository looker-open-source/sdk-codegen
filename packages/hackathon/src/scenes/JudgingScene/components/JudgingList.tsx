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
import React, { useEffect, useState } from 'react';
import {
  DataTable,
  DataTableItem,
  DataTableAction,
  DataTableCell,
  Pagination,
} from '@looker/components';
import { TextSnippet } from '@styled-icons/material-outlined/TextSnippet';
import { Create } from '@styled-icons/material-outlined/Create';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import type { IJudgingProps } from '../../../models';
import { sheetCell } from '../../../models';
import {
  getHackerState,
  getJudgingsHeadings,
} from '../../../data/hack_session/selectors';
import {
  getJudgingsRequest,
  updateJudgingsPageNum,
} from '../../../data/judgings/actions';
import {
  getJudgingsState,
  getJudgingsPageNumState,
} from '../../../data/judgings/selectors';
import { canDoJudgingAction } from '../../../utils';
import { PAGE_SIZE } from '../../../constants';
import { JudgingViewDialog } from '../../JudgingEditorScene';

interface JudgingListProps {}

export const JudgingList: FC<JudgingListProps> = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const columns = useSelector(getJudgingsHeadings);
  const hacker = useSelector(getHackerState);
  const judgings = useSelector(getJudgingsState);
  const currentPage = useSelector(getJudgingsPageNumState);
  const [currentJudging, setCurrentJudging] = useState<
    IJudgingProps | undefined
  >(undefined);

  useEffect(() => {
    dispatch(getJudgingsRequest());
  }, [dispatch]);

  const updatePage = (pageNum: number) => {
    dispatch(updateJudgingsPageNum(pageNum));
  };

  const handleView = (judging: IJudgingProps) => {
    setCurrentJudging(judging);
  };

  const closeView = () => {
    setCurrentJudging(undefined);
  };

  const handleUpdate = (judgingId: string) => {
    setTimeout(() => {
      history.push(`/judging/${judgingId}`);
    });
  };

  const actions = (judging: IJudgingProps) => {
    return (
      <>
        <DataTableAction
          onClick={handleView.bind(null, judging)}
          icon={<TextSnippet />}
        >
          View Judging
        </DataTableAction>
        {canDoJudgingAction(hacker, judging) && (
          <DataTableAction
            onClick={handleUpdate.bind(null, judging._id)}
            icon={<Create />}
            itemRole="link"
          >
            Update Judging
          </DataTableAction>
        )}
      </>
    );
  };

  const totalPages = Math.ceil(judgings.length / PAGE_SIZE);

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const rows = judgings
    .slice(startIdx, startIdx + PAGE_SIZE)
    .map((judging, idx) => (
      <DataTableItem
        key={idx}
        id={idx.toString()}
        actions={actions(judging)}
        onClick={handleView.bind(null, judging)}
      >
        {columns.map((column) => (
          <DataTableCell key={`${idx}.${column.id}`}>
            {sheetCell(judging[column.id])}
          </DataTableCell>
        ))}
      </DataTableItem>
    ));

  return (
    <>
      <DataTable columns={columns} caption="List of hackathon judges">
        {rows}
      </DataTable>
      <Pagination
        current={currentPage}
        pages={totalPages}
        onChange={updatePage}
      />
      <JudgingViewDialog judging={currentJudging} onClose={closeView} />
    </>
  );
};
