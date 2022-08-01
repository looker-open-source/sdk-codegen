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
import type { ReactNode, ReactNodeArray } from 'react'
import React, { useState } from 'react'
import { IconButton, Space } from '@looker/components'
import { Link } from '@styled-icons/material-outlined/Link'
import { getEnvAdaptor } from '@looker/extension-utils'
import { useLocation } from 'react-router-dom'

interface CopyLinkWrapperProps {
  children: ReactNode | ReactNodeArray
  visible?: boolean
}

const COPY_TO_CLIPBOARD = 'Copy to clipboard'

/**
 * Displays a copy link button on hover
 *
 * @param children component(s) which will render left of the button
 * @param visible boolean determining button visibility
 */
export const CopyLinkWrapper = ({
  children,
  visible = true,
}: CopyLinkWrapperProps) => {
  const [tooltipContent, setTooltipContent] = useState(COPY_TO_CLIPBOARD)
  const [showCopyLinkButton, setShowCopyLinkButton] = useState(false)
  const location = useLocation()
  const handleCopyLink = async () => {
    await getEnvAdaptor().copyToClipboard(location)
    setTooltipContent('Copied to clipboard')
  }
  const handleMouseLeave = () => {
    setTooltipContent(COPY_TO_CLIPBOARD)
  }
  return (
    <Space
      width={'100%'}
      onMouseEnter={() => setShowCopyLinkButton(true)}
      onMouseLeave={() => setShowCopyLinkButton(false)}
    >
      {children}
      {showCopyLinkButton && visible && (
        <IconButton
          onClick={handleCopyLink}
          icon={<Link />}
          size="small"
          label={tooltipContent}
          tooltipPlacement="bottom"
          onMouseLeave={handleMouseLeave}
        />
      )}
    </Space>
  )
}
