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
import { getExtensionSDK } from '@looker/extension-sdk'
import { ExtMarkdown } from '@looker/extension-utils'
import type { IHackerProps } from '../../models'
import { Agenda } from './components'
import { localAgenda } from './agenda'

interface HomeSceneProps {
  hacker: IHackerProps
}

export const HomeScene: FC<HomeSceneProps> = ({ hacker }) => {
  const schedule = localAgenda(hacker.locale)
  const host = getExtensionSDK().lookerHostData?.hostUrl
  const onClick = (_: string, href: string) =>
    getExtensionSDK().openBrowserWindow(href)

  const intro = `### Our [Hackathon FAQ](https://docs.google.com/document/d/e/2PACX-1vQc1dLGX9JwOmlFtMWb6miaRV5Id-DO6y22WPsgZ2ANv8aiCoaTvqto18DS5vC09UwiI19xVdwnHniP/pub) contains all event details! Please [join the Discord](https://discord.gg/N9EGGEzBjw) for communication!
*By accessing this hackathon application, you accept the [official rules](https://docs.google.com/document/d/e/2PACX-1vQk-UJ6G5NR-zfWndbXU3pmV88GIUgsb5M9L2dkTEbgTCsUaAUYtzUMkKfo5hGFxz3vxGnzrV2JvWD6/pub).*<br>
*Change your [account](${host}/account) timezone to display times in your timezone.*<br>`

  return (
    <>
      <SpaceVertical gap="u5">
        <Span>
          <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
            {'Agenda'}
          </Heading>
          <Paragraph>
            <ExtMarkdown source={intro} linkClickHandler={onClick} />
          </Paragraph>
        </Span>
        <Agenda schedule={schedule} hacker={hacker} />
      </SpaceVertical>
    </>
  )
}
