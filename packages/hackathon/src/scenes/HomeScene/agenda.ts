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

import type { AgendaItems } from './components'

export const agendaEn: AgendaItems = [
  {
    start: new Date('10 Nov 2021 08:00:00 GMT'),
    title: 'Hack@Home 2021 kick-off',
  },
  {
    start: new Date('10 Nov 2021 08:30:00 GMT'),
    title: 'Start hacking',
    description: `and don't stop until judging begins!`,
  },
  {
    start: new Date('10 Nov 2021 09:00:00 GMT'),
    title: `Looker staff office hour`,
  },
  {
    start: new Date('11 Nov 2021 10:00:00 GMT'),
    title: `Judging begins`,
    description: 'projects locked',
  },
  {
    start: new Date('11 Nov 2021 20:00:00 GMT'),
    stop: new Date('11 Nov 2021 21:30:00 GMT'),
    title: `Awards ceremony`,
  },
]

export const agendaJa: AgendaItems = [
  {
    start: new Date('10 Nov 2021 08:00:00 GMT'),
    title: '日本 Hack@Home 2021 kick-off',
  },
  {
    start: new Date('10 Nov 2021 08:30:00 GMT'),
    title: '日本 Start hacking',
    description: `and don't stop until judging begins!`,
  },
  {
    start: new Date('10 Nov 2021 09:00:00 GMT'),
    title: `日本 Looker staff office hour`,
  },
  {
    start: new Date('11 Nov 2021 10:00:00 GMT'),
    title: `日本 Judging begins`,
    description: 'projects locked',
  },
  {
    start: new Date('11 Nov 2021 20:00:00 GMT'),
    stop: new Date('11 Nov 2021 21:30:00 GMT'),
    title: `日本 Awards ceremony`,
  },
]
