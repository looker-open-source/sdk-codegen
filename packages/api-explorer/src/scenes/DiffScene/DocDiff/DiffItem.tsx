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
import React, { FC, useState, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionDisclosure,
  Box,
  Card,
} from '@looker/components'
import { DiffRow } from '@looker/sdk-codegen/src'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { ApiModel } from '@looker/sdk-codegen'

import { differ } from './docDiffUtils'
import { DiffBanner } from './DiffBanner'

interface DiffItemProps {
  item: DiffRow
  leftSpec: ApiModel
  rightSpec: ApiModel
}

export const DiffItem: FC<DiffItemProps> = ({ item, leftSpec, rightSpec }) => {
  const [method] = useState(
    leftSpec.methods[item.name]
      ? leftSpec.methods[item.name]
      : rightSpec.methods[item.name]
  )
  const [isOpen, setIsOpen] = useState(false)
  const [leftSide, setLeftSide] = useState<string>('')
  const [rightSide, setRightSide] = useState<string>('')

  useEffect(() => {
    const { lhs, rhs } = differ(item, leftSpec, rightSpec)
    setLeftSide(lhs)
    setRightSide(rhs)
  }, [leftSpec, rightSpec, isOpen])

  const handleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Card border="1px solid" borderColor="ui2">
      <Box>
        <Accordion
          indicatorPosition="left"
          isOpen={isOpen}
          toggleOpen={handleOpen}
        >
          <AccordionDisclosure px="small">
            <DiffBanner item={item} method={method} />
          </AccordionDisclosure>
          <AccordionContent>
            <ReactDiffViewer
              oldValue={leftSide}
              newValue={rightSide}
              splitView={true}
              compareMethod={DiffMethod.LINES}
              showDiffOnly={true}
            />
          </AccordionContent>
        </Accordion>
      </Box>
    </Card>
  )
}
