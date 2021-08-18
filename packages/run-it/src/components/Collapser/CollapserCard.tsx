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
import React, { FC, ReactElement } from 'react'
import {
  useToggle,
  Accordion,
  AccordionDisclosure,
  AccordionContent,
  Divider,
  Box,
} from '@looker/components'
import { ArrowRight } from '@styled-icons/material/ArrowRight'
import { ArrowDropDown } from '@styled-icons/material/ArrowDropDown'
import { RunItHeading } from '../common'

interface CollapserCardProps {
  id?: string
  heading: string
  children: ReactElement
  defaultOpen?: boolean
  divider?: boolean
}

/**
 * Render a collapsable header and children
 */
export const CollapserCard: FC<CollapserCardProps> = ({
  id,
  heading,
  children,
  defaultOpen = true,
  divider = true,
}) => {
  const level = divider ? 'h3' : 'h4'
  const { value, toggle } = useToggle(defaultOpen)

  return (
    <>
      {divider && <Divider appearance="light" />}
      <Accordion
        id={id}
        indicatorPosition="left"
        isOpen={value}
        toggleOpen={toggle}
        indicatorIcons={{ close: <ArrowRight />, open: <ArrowDropDown /> }}
      >
        <AccordionDisclosure>
          <RunItHeading as={level}>{heading}</RunItHeading>
        </AccordionDisclosure>
        <AccordionContent>
          <Box pb="xlarge">{children}</Box>
        </AccordionContent>
      </Accordion>
    </>
  )
}
