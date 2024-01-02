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

import { add } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import type { AgendaItems } from './components';
const day1 = zonedTimeToUtc('2022-12-06 00:00:00', 'America/Los_Angeles');
const day2 = add(day1, { days: 1 });
const day3 = add(day2, { days: 1 });
let current = day1;

const later = (start: Date, hours: number) => {
  current = add(start, { minutes: hours * 60 });
  return current;
};

// NOTE: if stop values are not defined, they default to the start of the next agenda item. All other stop values can default. The final stop value is required.
export const agenda = [
  {
    start: later(day1, 15),
    stop: later(day1, 15.5),
    description: {
      en: `## **Welcome & Kickoff**
On your mark, get set, GO! Meet you hackathon staff and get setup for success. <br>[**Live session link**](https://meet.google.com/vjd-gsco-xzu
)`,
      ja_JP: `## **ご挨拶とキックオフ**
このチャンスを是非ご活用ください。ハッカソンの担当者による説明を聞いて、成功への一歩を踏み出しましょう。<br>[**ライブ セッション リンク**](https://meet.google.com/vjd-gsco-xzu)`,
    },
  },
  {
    start: later(day1, 16),
    stop: later(day1, 18),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### AMER と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day1, 20),
    stop: later(day1, 22),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### AMER と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day2, 1),
    stop: later(day2, 3),
    description: {
      en: `### Office Hours (EMEA + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### EMEA と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day2, 9),
    stop: later(day2, 11),
    description: {
      en: `### Office Hours (EMEA + AMER)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### EMEA と AMER のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day2, 15),
    stop: later(day2, 15.5),
    description: {
      en: `## **Half-way Check In**
Half way there! Let’s check in on how you’re doing and go over how judging works.<br>[**Live session link**](meet.google.com/kgg-bgjs-ucc)`,
      ja_JP: `## **中間理解度チェック**
ここまでが前半です。ここまでの進捗状況と判定の仕組みを確認しましょう。<br>[**ライブ セッション リンク**](meet.google.com/kgg-bgjs-ucc)`,
    },
  },
  {
    start: later(day2, 16),
    stop: later(day2, 18),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### AMER と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day2, 19),
    stop: later(day2, 20),
    description: {
      en: `## **Break Time**
Virtually chill out with your fellow Cloud BI Developers and play some trivia! <br>[**Live session link**](https://meet.google.com/jov-mmvf-vgd
).`,
      ja_JP: `## **休憩**
他の Cloud BI 開発者たちとバーチャルでリラックスしながら、クイズを楽しみましょう。<br>[**ライブ セッション リンク**](https://meet.google.com/jov-mmvf-vgd)`,
    },
  },
  {
    start: later(day2, 20),
    stop: later(day2, 22),
    description: {
      en: `### Office Hours (AMER + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### AMER と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day3, 1),
    stop: later(day3, 3),
    description: {
      en: `### Office Hours (EMEA + APAC)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### EMEA と APAC のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day3, 9),
    stop: later(day3, 11),
    description: {
      en: `### Office Hours (EMEA + AMER)
Have a question? Meet your Looker, Google Data Studio, and other staff and ask them.Ask questions in [**#cloudbihack-help slack channel**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD).`,
      ja_JP: `### EMEA と AMER のオフィスアワー
ご不明な点がある場合は、Looker や Google データポータルなどの担当者に直接尋ねることができます。[**#cloudbihack-help Slack チャンネルでご質問をお寄せください。**](https://app.slack.com/client/T0A4R5X0F/C043T27QCMD)`,
    },
  },
  {
    start: later(day3, 13),
    stop: later(day3, 13),
    description: {
      en: `## **Project Due**
Projects will be locked.<br>
Please update your project description with your deliverables beforehand.`,
      ja_JP: `## **プロジェクトの提出締め切り**
Projects → Add Project機能が使えなくなります<br>
締め切りまでにProjects最新情報やデモなどご変更をお願い致します`,
    },
  },
  {
    start: later(day3, 14),
    stop: later(day3, 14),
    description: {
      en: `### Finalists announced`,
      ja_JP: '## ファイナリスト発表',
    },
  },
  {
    start: later(day3, 15),
    stop: later(day3, 15.75),
    description: {
      en: `## **Winners Ceremony with Demos**
Checkout which projects made “Best Hack” and “Nearly Best Hack” and watch some project demos!<br>[**Live session link**](https://meet.google.com/yif-qxfk-ejc
).`,
      ja_JP: `## **表彰式とデモ**
「Best Hack」賞と「Nearly Best Hack」賞を獲得したプロジェクトを発表します。プロジェクト デモもご覧ください。<br>[**ライブ セッション リンク**](https://meet.google.com/yif-qxfk-ejc)`,
    },
  },
  {
    start: later(day3, 16),
    stop: later(day3, 17),
    description: {
      en: `## **~Happy~ Hacky Hour**
Grab a drink and virtually chill out with your fellow Cloud BI Developers!<br>[**Live session link**](https://meet.google.com/bmn-cepn-fws)`,
      ja_JP: `## **ハッピーアワー**
他の Cloud BI 開発者たちと飲み物を片手にバーチャルでリラックスしましょう。<br>[**ライブ セッション リンク**](https://meet.google.com/bmn-cepn-fws)`,
    },
  },
];

export const localAgenda = (loc: string): AgendaItems =>
  agenda.map((i) => {
    const desc: any = i.description;
    return {
      start: i.start,
      stop: i.stop,
      description: desc[loc] ? desc[loc] : desc.en,
    };
  });
