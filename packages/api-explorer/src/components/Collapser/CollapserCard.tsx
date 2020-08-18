/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import React, { FC, ReactElement } from 'react'
import { useToggle, Space } from '@looker/components'
import { ApixHeading } from '../common'
import { Collapser } from './Collapser'

interface CollapserCardProps {
  heading: string
  children: ReactElement
  label: string
}

export const CollapserCard: FC<CollapserCardProps> = ({
  heading,
  children,
  label,
}) => {
  const { value, toggle } = useToggle(true)

  return (
    <>
      <Space gap="xsmall">
        <Collapser
          isOpen={value}
          onClick={toggle}
          openIcon={'CaretUp'}
          closeIcon={'CaretDown'}
          label={label}
        />
        <ApixHeading as="h2">{heading}</ApixHeading>
      </Space>
      {value && children}
    </>
  )
}
