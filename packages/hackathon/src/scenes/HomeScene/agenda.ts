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
import { zonedTimeToUtc } from 'date-fns-tz'
import type { AgendaItems } from './components'
const day1 = zonedTimeToUtc('2023-12-05 00:00:00', 'America/Los_Angeles')
const day2 = add(day1, { days: 1 })
const day3 = add(day2, { days: 1 })
let current = day1

const later = (start: Date, hours: number) => {
  current = add(start, { minutes: hours * 60 })
  return current
}

// NOTE: if stop values are not defined, they default to the start of the next agenda item. All other stop values can default. The final stop value is required.
export const agenda = [
  {
    start: later(day1, 9),
    stop: later(day1, 9.5),
    description: {
      en: `## **Welcome & Kickoff**
On your mark, get set, GO! Meet you hackathon staff and get setup for success. <br>[**Live session link**](https://meet.google.com/dtt-fett-duo
)`,
    },
  },
  {
    start: later(day1, 11),
    stop: later(day1, 13),
    description: {
      en: `### Office Hours (AMER + EMEA)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day1, 20),
    stop: later(day1, 22),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day2, 2),
    stop: later(day2, 4),
    description: {
      en: `### Office Hours (EMEA + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day2, 9),
    stop: later(day2, 11),
    description: {
      en: `### Office Hours (EMEA + AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day2, 11),
    stop: later(day2, 11.5),
    description: {
      en: `## **Half-way Check In**
Half way there! Let’s check in on how you’re doing and go over how judging works.<br>[**Live session link**](https://meet.google.com/hev-gjgs-xug)`,
    },
  },
  {
    start: later(day2, 12),
    stop: later(day2, 13),
    description: {
      en: `## **Break Time**
Virtually chill out with your fellow Cloud BI Developers and play some trivia! <br>[**Live session link**](https://meet.google.com/wjv-rbep-cbe).`,
    },
  },
  {
    start: later(day2, 13.5),
    stop: later(day2, 15.5),
    description: {
      en: `### Office Hours (AMER + EMEA)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day2, 20),
    stop: later(day2, 22),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day3, 2),
    stop: later(day3, 4),
    description: {
      en: `### Office Hours (EMEA + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day3, 9),
    stop: later(day3, 10),
    description: {
      en: `### Office Hours (EMEA + AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**discord #help channel**](https://discord.gg/ZH79hP3uGc).`,
    },
  },
  {
    start: later(day3, 10),
    stop: later(day3, 10),
    description: {
      en: `## **Project Due**
Projects will be locked.<br>
Please update your project description with your deliverables beforehand.`,
    },
  },
  {
    start: later(day3, 11.5),
    stop: later(day3, 11.5),
    description: {
      en: `### Finalists announced`,
    },
  },
  {
    start: later(day3, 13.5),
    stop: later(day3, 14),
    description: {
      en: `## **Winners Ceremony with Demos**
Checkout which projects made “Best Hack” and “Nearly Best Hack” and watch some project demos!<br>[**Live session link**](https://meet.google.com/jbu-oakc-hyk).`,
    },
  },
  {
    start: later(day3, 14),
    stop: later(day3, 15),
    description: {
      en: `## **~Happy~ Hacky Hour**
Grab a drink and virtually chill out with your fellow hackers and hackathon staff!<br>[**Live session link**](https://meet.google.com/dvm-jrxy-mgf)`,
    },
  },
]

export const localAgenda = (loc: string): AgendaItems =>
  agenda.map((i) => {
    return {
      start: i.start,
      stop: i.stop,
      description: i.description[loc] ? i.description[loc] : i.description.en,
    }
  })
