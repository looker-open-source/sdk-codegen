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
import React from 'react'
import styled from 'styled-components'
import { Paragraph, Table, Heading } from '@looker/components'
import type {
  HeadingProps,
  ParagraphProps,
  TableProps,
} from '@looker/components'

/**
 * Common styled components used by DocMarkdown
 */

export const MDHeading = styled(Heading).attrs(
  ({ mb = 'xsmall', pt = 'xsmall' }: HeadingProps) => ({ mb, pt })
)<HeadingProps>``

export const MDParagraph = styled(Paragraph).attrs(
  ({ mb = 'large' }: ParagraphProps) => ({
    mb,
  })
)<ParagraphProps>`
  color: ${({ theme }) => theme.colors.text5};
  max-width: 600px;
`

const OListInternal = styled.ol`
  color: ${({ theme }) => theme.colors.text5};
  max-width: 600px;
  margin-bottom: 20px;
`

const UListInternal = styled.ul`
  color: ${({ theme }) => theme.colors.text5};
  max-width: 600px;
  margin-bottom: 20px;
`

export const MDList: React.FC<any> = ({ ordered, ...rest }) => {
  return ordered ? <OListInternal {...rest} /> : <UListInternal {...rest} />
}

export const MDListItem = styled.li`
  color: ${({ theme }) => theme.colors.text5};
  max-width: 600px;
  margin-bottom: 4px;
  line-height: 1.5;
`

export const MDTable = styled(Table).attrs(({ mb = 'large' }: TableProps) => ({
  mb,
}))``
