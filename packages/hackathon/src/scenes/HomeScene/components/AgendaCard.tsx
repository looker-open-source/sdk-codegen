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
import {
  Card,
  CardContent,
  Heading,
  Space,
  SpaceVertical,
  Span,
} from '@looker/components'
import { Markdown } from '@looker/code-editor'
import { spanDate, spanEta, spanTime } from './agendaUtils'
import type { AgendaTime, IAgendaItem } from './agendaUtils'

interface AgendaCardProps {
  item: IAgendaItem
  language: string
}

export const AgendaCard: FC<AgendaCardProps> = ({ item, language }) => {
  const current: AgendaTime = new Date()
  return (
    <Card width="100%">
      <CardContent>
        <Space gap="u10">
          <SpaceVertical gap="u1">
            <Heading fontSize="small" color="text2" fontWeight="bold" as="h4">
              {spanDate(item.start, item.stop!, language)}
            </Heading>
            <Span fontSize="small" color="text2">
              {spanTime(item.start, item.stop!, language)}
            </Span>
          </SpaceVertical>
          <SpaceVertical gap="u1">
            <Heading as="h3" fontSize="xlarge">
              {item.title}
            </Heading>
            {item.description && <Markdown source={item.description} />}
          </SpaceVertical>
          <SpaceVertical gap="u1" align="end">
            {spanEta(current, item.start, item.stop!, language)}
          </SpaceVertical>
        </Space>
      </CardContent>
    </Card>
  )
}
