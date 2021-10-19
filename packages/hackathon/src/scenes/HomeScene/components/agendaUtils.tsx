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

import { Span } from '@looker/components'
import React from 'react'
// eslint-disable-next-line import/no-duplicates
import { format, formatDistance } from 'date-fns'
// eslint-disable-next-line import/no-duplicates
import { enUS, ja } from 'date-fns/locale'
import { utcToZonedTime } from 'date-fns-tz'
import cloneDeep from 'lodash/cloneDeep'

export type AgendaTime = Date

export interface IAgendaItem {
  /** Start datetime of agenda item */
  start: AgendaTime
  /** End of agenda item. If not specified, the next chronological event will be its end time */
  stop?: AgendaTime
  /** Markdown description of agenda item */
  description: string
}

export type AgendaItems = Array<IAgendaItem>

export const zoneDate = (time: AgendaTime, zone: string) => {
  return utcToZonedTime(time, zone)
}

export const dateLocale = (locale: string) => (locale === 'ja_JP' ? ja : enUS)

/**
 * Format a date using locale and string template
 *
 * Template values are documented at https://date-fns.org/v2.25.0/docs/format
 *
 * @param value to format
 * @param locale to localize
 * @param template for formatting
 */
export const dateString = (
  value: AgendaTime,
  locale: string,
  template = 'LLL'
) => {
  return format(value, template, { locale: dateLocale(locale) })
}

export const monthDay = (value: AgendaTime, locale: string) => {
  return dateString(value, locale, 'MMM do')
}

export const spanDate = (
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  let result = monthDay(start, locale)
  if (start.getDate() !== stop.getDate()) {
    result += ` - ${dateString(stop, locale, 'do')}`
  }
  return result
}

export const diff = (first: AgendaTime, second: AgendaTime, locale: string) => {
  return formatDistance(second, first, {
    addSuffix: true,
    locale: dateLocale(locale),
  })
}

export const spanEta = (
  now: AgendaTime,
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  let color = 'warn'
  let phrase = ''
  if (now < start) {
    color = 'warn'
    phrase = diff(now, start, locale)
  } else if (now < stop) {
    color = 'positive'
    phrase = diff(now, stop, locale)
  } else {
    color = 'critical'
    phrase = diff(now, stop, locale)
  }
  return (
    <Span fontSize="small" color={color}>
      {phrase}
    </Span>
  )
}

export const spanTime = (
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  const template = 'K:mm b'
  return `${dateString(start, locale, template)} - ${dateString(
    stop,
    locale,
    template
  )}`
}

export const calcAgenda = (swap: AgendaItems, timezone: string) => {
  const agenda = cloneDeep(swap).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  agenda.forEach((item, index) => {
    item.start = zoneDate(item.start, timezone)
    // Fill in any missing stop values with the next item's start value
    if (!item.stop) {
      if (index < agenda.length) {
        item.stop = agenda[index + 1].start
      }
    }
    item.stop = zoneDate(item.stop!, timezone)
  })
  return agenda
}
