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
const day1 = zonedTimeToUtc('2022-12-06 00:00:00', 'America/Los_Angeles')
const day2 = add(day1, { days: 1 })
let current = day1

const later = (start: Date, hours: number) => {
  current = add(start, { minutes: hours * 60 })
  return current
}

const MARKDOWN_LINEBREAK = '  '

/**
 * from https://looker.com/events/join/agenda?agendaPath=session/616880
 */
export const agenda = [
  {
    start: later(day1, -4), // Nov 9th
    // NOTE: if stop values are not defined, they default to the start of the next agenda item
    stop: later(day1, -3.5), // Nov 9th
    description: {
      en: `## **Welcome Session** (APAC)
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **開会 APAC（ご案内・注意事項など)**
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day1, 1), // Nov 10th
    stop: later(day1, 1.5), // Nov 10th
    description: {
      en: `## **Welcome Session** (EMEA)
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **開会 EMEA（ご案内・注意事項など)**
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day1, 10),
    stop: later(day1, 10.5),
    description: {
      en: `## **Welcome Session** (AMER)
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **開会 AMER（ご案内・注意事項など)**
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day1, -3.5), // Nov 9th
    stop: later(day1, -2),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 1.5), // Nov 10th
    stop: later(day1, 3.5),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 5), // Nov 10th
    stop: later(day1, 7),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English supported._`,
      ja_JP: `### サポート時間 (対応言語：英)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 10.5),
    stop: later(day1, 13),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English supported._`,
      ja_JP: `### サポート時間 (対応言語：英)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 14.5),
    stop: later(day1, 16),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 17),
    stop: later(day1, 19),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day1, 19),
    description: {
      en: `### **Hack@Night session**
Random fun little session!${MARKDOWN_LINEBREAK}
[Live session link](https://meet.google.com/daw-pwci-gpm)`,
      ja_JP: `**Hack@Night Session**
アメリカの夜懇親会!${MARKDOWN_LINEBREAK}
[生放送をご視ください](https://meet.google.com/daw-pwci-gpm)`, //
    },
  },
  {
    start: later(day2, -4),
    stop: later(day2, -3.5),
    description: {
      en: `## **Check-In Session** (APAC)
Day 2 check-in with important info.${MARKDOWN_LINEBREAK}
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **ラウンドテーブル Check-in** (APAC)
進捗、注意点、お知らせなど${MARKDOWN_LINEBREAK}
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day2, 1),
    stop: later(day2, 1.5),
    description: {
      en: `## **Check-In Session** (EMEA)
Day 2 check-in with important info.${MARKDOWN_LINEBREAK}
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **ラウンドテーブル Check-in** (EMEA)
進捗、注意点、お知らせなど${MARKDOWN_LINEBREAK}
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day2, 10),
    stop: later(day2, 10.5),
    description: {
      en: `## **Check-In Session** (AMER)
Day 2 check-in with important info.${MARKDOWN_LINEBREAK}
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
      ja_JP: `## **ラウンドテーブル Check-in** (AMER)
進捗、注意点、お知らせなど${MARKDOWN_LINEBREAK}
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880)`,
    },
  },
  {
    start: later(day2, -3.5),
    stop: later(day2, -2),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day2, 1.5),
    stop: later(day2, 3.0),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English and Japanese supported._`,
      ja_JP: `### サポート時間 (対応言語：英・日)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day2, 5),
    stop: later(day2, 7),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English supported._`,
      ja_JP: `### サポート時間 (対応言語：英)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day2, 10.5),
    stop: later(day2, 12),
    description: {
      en: `### Supported hacking hours
Ask questions in [#lookerhack-help slack channel](https://app.slack.com/client/T0A4R5X0F/C02HPKQKSFM).${MARKDOWN_LINEBREAK}
_English supported._`,
      ja_JP: `### サポート時間 (対応言語：英)
[Slackの#lookerhack-helpチャネル](https://app.slack.com/client/T0A4R5X0F/C02ELGL644F)で質問を受けております`,
    },
  },
  {
    start: later(day2, 13),
    stop: later(day2, 15.5),
    description: {
      en: `## **Project Judging**
Projects will be locked.${MARKDOWN_LINEBREAK}
Please update your project description with your deliverables beforehand.`,
      ja_JP: `## **プロジェクトの提出締め切り**
Projects → Add Project機能が使えなくなります${MARKDOWN_LINEBREAK}
締め切りまでにProjects最新情報やデモなどご変更をお願い致します`,
    },
  },
  {
    start: later(day2, 14),
    stop: later(day2, 14),
    description: {
      en: `## **Finalists announced**`,
      ja_JP: '## ファイナリスト発表',
    },
  },
  {
    start: later(day2, 15.5),
    stop: later(day2, 16.5),
    description: {
      en: `## **Closing Session**
Winners announced.${MARKDOWN_LINEBREAK}
[Live session link](https://looker.com/events/join/agenda?agendaPath=session/616880).`,
      ja_JP: `## **クロウジング**
優秀賞発表 & 優秀賞デモ ${MARKDOWN_LINEBREAK}
[生放送をご視ください](https://looker.com/events/join/agenda?agendaPath=session/616880).`,
    },
  },
  // NOTE: All other stop values can default. The final stop value is required.
  {
    start: later(day2, 16.5),
    stop: later(day2, 17.5),
    description: {
      en: `## **~Happy~ Hacky Hour**
Let's hang out and celebrate!${MARKDOWN_LINEBREAK}
[Live session link](https://meet.google.com/daw-pwci-gpm)`,
      ja_JP: `## **~Happy~ Hacky Hour(懇親会)**
[生放送をご視ください](https://meet.google.com/daw-pwci-gpm)
`,
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
