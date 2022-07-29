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
import React, { ReactNode, ReactNodeArray, useState, useCallback } from 'react'
import { IconButton, Space } from '@looker/components'
import { Link } from '@styled-icons/material-outlined/Link'

interface CopyLinkWrapperProps {
  visible?: boolean
  children: ReactNode | ReactNodeArray
}

const COPY_TO_CLIPBOARD = 'Copied to clipboard'
const COPY_TO_SECTION = 'Copy link to this section'

export const CopyLinkWrapper = ({
  visible = true,
  children,
}: CopyLinkWrapperProps) => {
  const [showCopyLinkButton, setShowCopyLinkButton] = useState(false)
  const [tooltipContent, setTooltipContent] = useState(COPY_TO_SECTION)

  const onCopyLink = useCallback(async () => {
    setTooltipContent(COPY_TO_CLIPBOARD)
    // TODO - this wont work in the extension - there are other mechanisms
    await navigator.clipboard.writeText(location.href)
  }, [setTooltipContent])

  const onCopyButtonMouseLeave = useCallback(async () => {
    setTooltipContent(COPY_TO_SECTION)
  }, [setTooltipContent])

  return (
    <>
      <Space
        onMouseEnter={() => setShowCopyLinkButton(true)}
        onMouseLeave={() => setShowCopyLinkButton(false)}
        width="100%"
      >
        {children}
        {visible && showCopyLinkButton && (
          <IconButton
            onClick={onCopyLink}
            onMouseLeave={onCopyButtonMouseLeave}
            size="small"
            icon={<Link />}
            label={tooltipContent}
            tooltipPlacement="bottom"
          />
        )}
      </Space>
    </>
  )
}
