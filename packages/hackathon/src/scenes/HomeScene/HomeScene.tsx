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

import type { FC } from 'react';
import React from 'react';

import { Heading, Paragraph, SpaceVertical, Span } from '@looker/components';
import { getExtensionSDK } from '@looker/extension-sdk';
import { ExtMarkdown } from '@looker/extension-utils';
import type { IHackerProps } from '../../models';
import { Agenda } from './components';
import { localAgenda } from './agenda';

interface HomeSceneProps {
  hacker: IHackerProps;
}

export const HomeScene: FC<HomeSceneProps> = ({ hacker }) => {
  const schedule = localAgenda(hacker.locale);
  const host = getExtensionSDK().lookerHostData?.hostUrl;
  const onClick = (_: string, href: string) =>
    getExtensionSDK().openBrowserWindow(href);

  const intro =
    hacker.locale === 'ja_JP'
      ? `### ハッカソン詳細については、[よくある質問記事](https://docs.google.com/document/d/e/2PACX-1vTGRC2Y8FgJ0tFc6Uxc6ktV24lNgZPnNNvyyh3b4o0schX9VlL5AmNICuYzwKAB0xJl3xUQ8c4kuM9k/pub)をご確認いただけます。
現地時間が表示されるため、[アカウント](${host}/account)の「タイムゾーン」を設定できます。<br>
アジェンダが日本語で表示されるため、[アカウント](${host}/account)の「Locale」は「ja_JP」に指定できます。
`
      : `### Our [Hackathon FAQ](https://docs.google.com/document/d/e/2PACX-1vTGRC2Y8FgJ0tFc6Uxc6ktV24lNgZPnNNvyyh3b4o0schX9VlL5AmNICuYzwKAB0xJl3xUQ8c4kuM9k/pub) contains all event details! 
*By accessing this hackathon application, you accept the [official rules](https://docs.google.com/document/d/e/2PACX-1vTNdWv2e21BiTOspuyj8S_FN0mDmsT-bVyjr6OCMeWTbBvuA6UaoVSUy69OBy8WCElCl7_-L877WSb2/pub).*<br>
*Change your [account](${host}/account) timezone to display times in your timezone.*<br>
*Change your [account](${host}/account) locale to \`ja_JP\` to display the agenda in Japanese.*`;

  const headingText = hacker.locale === 'ja_JP' ? 'アジェンダ' : 'Agenda';

  return (
    <>
      <SpaceVertical gap="u5">
        <Span>
          <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
            {headingText}
          </Heading>
          <Paragraph>
            <ExtMarkdown source={intro} linkClickHandler={onClick} />
          </Paragraph>
        </Span>
        <Agenda schedule={schedule} hacker={hacker} />
      </SpaceVertical>
    </>
  );
};
