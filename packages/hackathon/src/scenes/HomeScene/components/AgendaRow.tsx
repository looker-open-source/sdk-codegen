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
import { Markdown } from '@looker/code-editor'
import type { IHackerProps } from '../../../models'
import { spanDate, spanEta, spanTime, zoneDate } from './agendaUtils'
import type { AgendaTime, IAgendaItem } from './agendaUtils'

interface AgendaCardProps {
  item: IAgendaItem
  hacker: IHackerProps
}

export const rowColor = (item: IAgendaItem) => {
  if (item.description.startsWith('#')) return '#ccc'
  if (item.description.startsWith('#')) return '#bbb'
  if (item.description.startsWith('_')) return '#aaa'
  return '#white'
}

export const AgendaRow: FC<AgendaCardProps> = ({ item, hacker }) => {
  const current: AgendaTime = zoneDate(new Date(), hacker.timezone)
  return (
    <TableRow color={rowColor(item)}>
      <TableDataCell>
        <Heading fontSize="small" color="text2" fontWeight="bold" as="h5">
          {spanDate(item.start, item.stop!, hacker.locale)}
        </Heading>
        <Span fontSize="small" color="text2">
          {spanTime(item.start, item.stop!, hacker.locale)}
        </Span>
      </TableDataCell>
      <TableDataCell>
        <Markdown source={item.description} />
      </TableDataCell>
      <TableDataCell>
        {spanEta(current, item.start, item.stop!, hacker.locale)}
      </TableDataCell>
    </TableRow>
  )
}
