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
import moment from 'moment-timezone'
import React, { useEffect, useState } from 'react'
import { Markdown } from '@looker/code-editor'

import {
  Select,
  Space,
  Table,
  TableBody,
  TableRow,
  TableDataCell,
} from '@looker/components'
import type { Agenda } from './agenda'
import { agendaEn, agendaJa } from './agenda'
const English = 'English'
const Japanese = '日本'

const dateString = (value: number, language: string) => {
  const zone = language === English ? 'America/Los_Angeles' : 'Asia/Tokyo'
  return moment(value).tz(zone).format('LLL')
}

const calcAgenda = (swap: Agenda) => {
  swap = swap.sort((a, b) => a.start - b.start)
  swap.forEach((i, index) => {
    // Fill in any missing stop values with the next item's start value
    if (!i.stop) {
      if (index <= swap.length + 1) {
        i.stop = swap[index + 1].start
      }
    }
  })
  return swap
}

export const HomeScene: FC = () => {
  const [value, setValue] = useState<string>(English)
  const [agenda, setAgenda] = useState<Agenda>(calcAgenda(agendaEn))
  const options = [
    { value: English, label: English },
    { value: Japanese, label: Japanese },
  ]

  useEffect(() => {
    switch (value) {
      case English:
        setAgenda(calcAgenda(agendaEn))
        break
      case Japanese:
        setAgenda(calcAgenda(agendaJa))
        break
    }
  }, [value])

  return (
    <>
      <Space align="start">
        <Space>
          <Table verticalAlign={'top'}>
            <TableBody>
              {agenda.map((i, index) => (
                <TableRow key={`row${index}`}>
                  <TableDataCell>{dateString(i.start, value)}</TableDataCell>
                  <TableDataCell>{dateString(i.stop!, value)}</TableDataCell>
                  <TableDataCell>
                    <Markdown source={i.description} />
                  </TableDataCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Space>
        <Space>
          <Select
            maxWidth={150}
            listLayout={{ width: 'auto' }}
            options={options}
            value={value}
            onChange={setValue}
          />
        </Space>
      </Space>
    </>
  )
}
