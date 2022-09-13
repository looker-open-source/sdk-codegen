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

import type { FC } from 'react'
import React from 'react'
import { TableRow, TableDataCell, Heading, Span } from '@looker/components'
import { ExtMarkdown } from '@looker/extension-utils'
import type { IHackerProps } from '../../../models'
import { gapDate, gapDiff, gapTime, zoneDate } from './agendaUtils'
import type { AgendaTime, IAgendaItem } from './agendaUtils'

interface AgendaCardProps {
  item: IAgendaItem
  hacker: IHackerProps
  color: string
}

export const AgendaRow: FC<AgendaCardProps> = ({ item, hacker, color }) => {
  const current: AgendaTime = zoneDate(new Date(), hacker.timezone)
  const start = zoneDate(item.start, hacker.timezone)
  const stop = zoneDate(item.stop!, hacker.timezone)
  return (
    <TableRow>
      <TableDataCell width="20%">
        <Heading fontSize="small" color="text2" fontWeight="bold" as="h5">
          {gapDate(start, stop, hacker.locale)}
        </Heading>
        <Span fontSize="small" color="text2">
          {gapTime(start, stop, hacker.locale)}
        </Span>
      </TableDataCell>
      <TableDataCell>
        <ExtMarkdown source={item.description} />
      </TableDataCell>
      <TableDataCell width="10%">
        <Span fontSize="small" color={color}>
          {gapDiff(current, start, stop, hacker.locale)}
        </Span>
      </TableDataCell>
    </TableRow>
  )
}
