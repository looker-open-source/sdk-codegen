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

export interface IAgendaItem {
  /** Start datetime of agenda item */
  start: number
  /** End of agenda item. If not specified, the next chronological event will be its end time */
  stop?: number
  /** Markdown describing item */
  description: string
}

export type Agenda = Array<IAgendaItem>
/*
| Start Time      | End Time        | Description                         |
| --------------- | --------------- | ----------------------------------- |
| Nov 10 9:00 am  | Nov 10 9:15 am  | Kick off                            |
| Nov 10 9:15 am  | Nov 10 10:10 am | Start hacking, and don't stop!      |
| Nov 10 10:00 am | Nov 10 11:00 am | Looker staff office hour            |
| Nov 11 4:00 pm  | Nov 11 6:00 pm  | Hackathon judging (projects locked) |
| Nov 11 6:00 pm  | Nov 11 7:00 pm  | Hackathon award ceremony            |

 */

export const agendaEn: Agenda = [
  {
    start: Date.parse('10 Nov 2021 08:00:00 GMT'),
    description: 'Hack@Home 20201 kick-off',
  },
  {
    start: Date.parse('10 Nov 2021 08:30:00 GMT'),
    description: `Start hacking, and don't stop until judging begins!`,
  },
  {
    start: Date.parse('10 Nov 2021 09:00:00 GMT'),
    description: `Looker staff office Hour`,
  },
  {
    start: Date.parse('11 Nov 2021 10:00:00 GMT'),
    description: `Judging begins (projects locked)`,
  },
  {
    start: Date.parse('11 Nov 2021 20:00:00 GMT'),
    stop: Date.parse('11 Nov 2021 21:30:00 GMT'),
    description: `Awards ceremony and closing`,
  },
]

export const agendaJa: Agenda = [
  {
    start: Date.parse('10 Nov 2021 08:00:00 GMT'),
    description: '日本 Hack@Home 20201 kick-off',
  },
  {
    start: Date.parse('10 Nov 2021 08:30:00 GMT'),
    description: `日本 hacking, and don't stop until judging begins!`,
  },
  {
    start: Date.parse('10 Nov 2021 09:00:00 GMT'),
    description: `日本 Looker staff office Hour`,
  },
  {
    start: Date.parse('11 Nov 2021 10:00:00 GMT'),
    description: `日本 Judging begins (projects locked)`,
  },
  {
    start: Date.parse('11 Nov 2021 20:00:00 GMT'),
    stop: Date.parse('11 Nov 2021 21:30:00 GMT'),
    description: `日本 Awards ceremony and closing`,
  },
]
