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
import React, { useEffect, useState } from 'react'

import { Select, Space, Heading, SpaceVertical } from '@looker/components'
import { agendaEn, agendaJa } from './agenda'
import type { AgendaItems } from './components'
import { Agenda, English, Japanese } from './components'

export const HomeScene: FC = () => {
  const [value, setValue] = useState<string>(English)
  const [agenda, setAgenda] = useState<AgendaItems>(agendaEn)
  const options = [
    { value: English, label: English },
    { value: Japanese, label: Japanese },
  ]

  useEffect(() => {
    switch (value) {
      case English:
        setAgenda(agendaEn)
        break
      case Japanese:
        setAgenda(agendaJa)
        break
    }
  }, [value])

  return (
    <>
      <SpaceVertical gap="u5">
        <Space between>
          <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
            Agenda
          </Heading>
          <Select
            maxWidth={150}
            listLayout={{ width: 'auto' }}
            options={options}
            value={value}
            onChange={setValue}
          />
        </Space>

        <SpaceVertical>
          <Agenda schedule={agenda} language={value} />
        </SpaceVertical>
      </SpaceVertical>
    </>
  )
}
