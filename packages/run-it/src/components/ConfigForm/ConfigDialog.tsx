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

import React, { Dispatch, FC } from 'react'
import {
  Dialog,
  DialogContent,
  IconNames,
  useToggle,
  IconButton,
} from '@looker/components'
import { ConfigForm } from './ConfigForm'

interface ConfigDialogProps {
  /** Icon to use for config dialog */
  icon?: IconNames
  /** A set state callback fn used to set a hasConfig flag indicating whether OAuth config details are present */
  setHasConfig?: Dispatch<boolean>
}

export const ConfigDialog: FC<ConfigDialogProps> = ({
  icon = 'GearOutline',
  setHasConfig,
}) => {
  const { value, setOff, setOn } = useToggle()
  return (
    <>
      <Dialog
        isOpen={value}
        onClose={setOff}
        maxWidth={['90vw', '60vw', '500px', '800px']}
      >
        <DialogContent>
          <ConfigForm setHasConfig={setHasConfig} handleClose={setOff} />
        </DialogContent>
      </Dialog>
      <IconButton label="Settings" color="key" icon={icon} onClick={setOn} />
    </>
  )
}
