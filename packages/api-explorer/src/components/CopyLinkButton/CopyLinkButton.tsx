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
import React, { useState } from 'react'
import { IconButton } from '@looker/components'
import { Link } from '@styled-icons/material-outlined/Link'
import styled from 'styled-components'

interface CopyLinkButtonProps {
  visible: boolean
}
export const CopyLinkButton = ({ visible }: CopyLinkButtonProps) => {
  const [title, CopyLinkTooltip] = useState('Copy link to this page view')
  return (
    <CopyLink visible={visible}>
      <IconButton
        onClick={async () => {
          CopyLinkTooltip('Copied to clipboard')
          await navigator.clipboard.writeText(location.href)
        }}
        onMouseEnter={() => CopyLinkTooltip('Copy link to this section')}
        size="small"
        icon={<Link />}
        label={title}
        tooltipPlacement="bottom"
      />
    </CopyLink>
  )
}

const CopyLink = styled('span')<{ visible: boolean }>`
  position: absolute;
  top: 4px;
  right: 36px;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`
