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

import { add } from 'date-fns'
import type { AgendaItems } from './agendaUtils'
import { agendaEras, spanEta } from './agendaUtils'

const pt = 'America/Los_Angeles'
const now = new Date()
const before = add(now, { hours: -1 })
const after = add(now, { hours: 1 })
const english = 'en'
const japanese = 'ja_JP'
export const eraSchedule: AgendaItems = [
  { start: before, stop: add(now, { minutes: -1 }), description: 'past' },
  { start: now, stop: add(now, { minutes: 30 }), description: 'present' },
  { start: add(now, { minutes: 30 }), stop: after, description: 'future' },
]

describe('agendaUtils', () => {
  describe('spanEta', () => {
    describe('in English', () => {
      const locale = english
      test('it shows before', () => {
        const actual = spanEta(now, add(now, { minutes: 30 }), after, locale)
        expect(actual.props.children).toEqual('in 30 minutes')
      })

      test('it shows during', () => {
        const actual = spanEta(now, before, after, locale)
        expect(actual.props.children).toEqual('in about 1 hour')
      })

      test('it shows after', () => {
        const actual = spanEta(now, before, add(now, { minutes: -30 }), locale)
        expect(actual.props.children).toEqual('30 minutes ago')
      })
    })
    describe('in Japanese', () => {
      const locale = japanese
      test('it shows before', () => {
        const actual = spanEta(now, add(now, { minutes: 30 }), after, locale)
        expect(actual.props.children).toEqual('30分後')
      })

      test('it shows during', () => {
        const actual = spanEta(now, before, after, locale)
        expect(actual.props.children).toEqual('約1時間後')
      })

      test('it shows after', () => {
        const actual = spanEta(now, before, add(now, { minutes: -30 }), locale)
        expect(actual.props.children).toEqual('30分前')
      })
    })
  })

  test('agendaPeriods', () => {
    const current = now.getTime()
    expect(current).toBeGreaterThan(eraSchedule[0].start.getTime())
    expect(current).toBeGreaterThan(eraSchedule[0].stop!.getTime())
    expect(current).toBeGreaterThanOrEqual(eraSchedule[1].start.getTime())
    expect(current).toBeLessThan(eraSchedule[1].stop!.getTime())
    expect(current).toBeLessThan(eraSchedule[2].start.getTime())
    expect(current).toBeLessThan(eraSchedule[2].stop!.getTime())

    const actual = agendaEras(eraSchedule, pt, now)
    expect(actual.past).toHaveLength(1)
    expect(actual.present).toHaveLength(1)
    expect(actual.future).toHaveLength(1)
  })
})
