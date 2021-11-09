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

import { Heading, SpaceVertical, Paragraph, Span } from '@looker/components'
import type { IHackerProps } from '../../models'
import { ExtMarkdown } from '../../components'
import { Agenda } from './components'
import { localAgenda } from './agenda'

interface HomeSceneProps {
  hacker: IHackerProps
}

const MARKDOWN_LINEBREAK = '  '

export const HomeScene: FC<HomeSceneProps> = ({ hacker }) => {
  const schedule = localAgenda(hacker.locale)

  return (
    <>
      <SpaceVertical gap="u5">
        <Span>
          <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
            Agenda
          </Heading>
          <Paragraph>
            <ExtMarkdown
              source={`### Our [Hackathon FAQ](https://community.looker.com/hackathome-2021-1026/hackathome-2021-attendee-faq-28429) contains all event details! 
*Change your [account](https://hack.looker.com/account) timezone to display times in your timezone*${MARKDOWN_LINEBREAK}
*Change your [account](https://hack.looker.com/account) locale to ${'`ja_JP`'} to display agenda in Japanese.*${MARKDOWN_LINEBREAK}
${MARKDOWN_LINEBREAK}${MARKDOWN_LINEBREAK}
### ハッカソン詳細については、[よくある質問記事](https://community.looker.com/hackathome-2021-1026/hackathome-2021-%E3%82%88%E3%81%8F%E3%81%82%E3%82%8B%E8%B3%AA%E5%95%8F-28518)をご確認いただけます。
現地時間が表示されるため、[アカウント](https://hack.looker.com/account)の「タイムゾーン」を設定できます。${MARKDOWN_LINEBREAK}
アジェンダが日本語で表示されるため、[アカウント](https://hack.looker.com/account)の「Locale」は「ja_JP」に指定できます。
`}
            />
          </Paragraph>
        </Span>
        <Agenda schedule={schedule} hacker={hacker} />
      </SpaceVertical>
    </>
  )
}
