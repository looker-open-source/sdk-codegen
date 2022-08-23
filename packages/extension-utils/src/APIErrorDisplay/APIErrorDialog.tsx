/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { Button, Dialog, DialogLayout } from '@looker/components'
import type { APIErrorDisplayProps } from './APIErrorDisplay'
import { APIErrorContent } from './APIErrorContent'
import { errorHeading } from './utils'

interface APIErrorDialogProps extends APIErrorDisplayProps {
  /** toggle for dialog being open */
  isOpen?: boolean
  /** callback for toggling the dialog display */
  setOpen?: (open: boolean) => void
}

export const APIErrorDialog: FC<APIErrorDialogProps> = ({
  error,
  isOpen = true,
  setOpen = undefined,
  showDoc = false,
}) => {
  if (!setOpen) {
    setOpen = (toggle) => (isOpen = toggle)
  }
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setOpen && setOpen(false)}
      content={
        <DialogLayout
          header={errorHeading(error)}
          footer={
            <Button size="xsmall" onClick={() => setOpen && setOpen(false)}>
              OK
            </Button>
          }
        >
          <APIErrorContent error={error} showDoc={showDoc} />
        </DialogLayout>
      }
    />
  )
}
