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

import { renderWithTheme } from '@looker/components-test-utils';
import React from 'react';
import { screen } from '@testing-library/react';

import type { IHacker } from '../../../models';
import { Agenda } from './Agenda';
import { eraSchedule } from './agendaUtils.spec';

const hacker = {
  timezone: 'America/Los_Angeles',
  locale: 'en',
} as IHacker;

describe('<Agenda />', () => {
  test('displays all eras with only Present expanded', async () => {
    renderWithTheme(<Agenda schedule={eraSchedule} hacker={hacker} />);
    const past = screen.getByRole('button', { name: 'Past' });
    expect(past).toBeInTheDocument();
    const present = screen.getByRole('button', { name: 'Present' });
    expect(present).toBeInTheDocument();
    const future = screen.getByRole('button', { name: 'Future' });
    expect(future).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'present' })).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'past' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'future' })
    ).not.toBeInTheDocument();
  });
});
