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
import moment from 'moment-timezone'
import React from 'react'

export type AgendaTime = Date

export interface IAgendaItem {
  /** Start datetime of agenda item */
  start: AgendaTime
  /** End of agenda item. If not specified, the next chronological event will be its end time */
  stop?: AgendaTime
  /** Title of agenda item */
  title: string
  /** Markdown describing item */
  description?: string
}

export type AgendaItems = Array<IAgendaItem>

export const English = 'English'
export const Japanese = '日本'

export const languageZone = (language: string) => {
  const zone = language === English ? 'America/Los_Angeles' : 'Asia/Tokyo'
  return zone
}

export const zoneDate = (time: AgendaTime, zone: string) => {
  return moment(time).tz(zone)
}

export const languageLocale = (language: string) => {
  return language === English ? 'en' : 'ja'
}

export const localeDate = (value: AgendaTime, language: string) => {
  const local = zoneDate(value, languageZone(language))
  return local.locale(languageLocale(language))
}

export const dateString = (value: AgendaTime, language: string) => {
  const local = localeDate(value, languageZone(language))
  return local.format('LLL')
}

export const monthDay = (value: moment.Moment) => {
  return value.format('MMM Do')
}

export const spanDate = (
  start: AgendaTime,
  stop: AgendaTime,
  language: string
) => {
  const localStart = localeDate(start, language)
  const localStop = localeDate(stop, language)
  let result = monthDay(localStart)
  if (localStart.day() !== localStop.day()) {
    result += ` - ${localStop.format('Do')}`
  }
  return result
}

export const spanEta = (
  current: AgendaTime,
  start: AgendaTime,
  stop: AgendaTime,
  language: string
) => {
  const zone = languageZone(language)
  const localStart = zoneDate(start, zone)
  const localStop = zoneDate(stop, zone)
  const now = moment(current)
  let color = 'warn'
  let phrase = ''
  // TODO replace deprecated moment js with https://www.npmjs.com/package/spacetime and use .since() here
  if (now.diff(localStart) < 0) {
    color = 'warn'
    phrase = `starts in ${Math.abs(now.diff(localStart, 'days'))} days`
  } else if (now.diff(localStop) < 0) {
    color = 'positive'
    phrase = `ends in ${Math.abs(now.diff(localStop, 'hours'))} hours`
  } else {
    color = 'critical'
    phrase = `ended ${Math.abs(now.diff(localStart, 'hours'))} hours ago`
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
  language: string
) => {
  const zone = languageZone(language)
  const localStart = zoneDate(start, zone)
  const localStop = zoneDate(stop, zone)
  let result = localStart.format('LT')
  if (Math.abs(localStart.diff(localStop, 'seconds')) >= 1) {
    result += ` - ${localStop.format('LT')}`
  }
  return result
}

export const calcAgenda = (swap: AgendaItems) => {
  swap = swap.sort((a, b) => a.start.getTime() - b.start.getTime())
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
