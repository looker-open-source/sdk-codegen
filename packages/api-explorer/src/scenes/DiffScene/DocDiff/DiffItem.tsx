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
import React, { useState, useEffect } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import styled from 'styled-components'
import { Accordion2, Box, Card, Grid, Heading, Link } from '@looker/components'
import type { DiffRow } from '@looker/sdk-codegen/src'
import type { ApiModel, IMethod } from '@looker/sdk-codegen'
import { useSelector } from 'react-redux'
import { selectSdkLanguage } from '../../../state'
import {
  buildMethodPath,
  getLanguageByAlias,
  useNavigation,
} from '../../../utils'
import { DiffBanner } from './DiffBanner'
import { differ } from './docDiffUtils'

interface DiffMethodLinkProps {
  method: IMethod | undefined
  specKey: string
}

const DiffLink = styled(Link)`
  color: ${({ theme }) => theme.colors.ui5};
  cursor: pointer;
  display: block;
  padding: ${({ theme }) => `${theme.space.xsmall} ${theme.space.large}`};
  &:hover,
  &:visited,
  &:focus,
  &.active {
    color: ${({ theme }) => theme.colors.key};
    cursor: pointer;
  }
`

export const DiffMethodLink: FC<DiffMethodLinkProps> = ({
  method,
  specKey,
}) => {
  const navigate = useNavigation()

  if (!method) return <Heading as="h4">{`Missing in ${specKey}`}</Heading>

  const tag = method.schema.tags[0]
  const path = `${buildMethodPath(specKey, tag, method.name)}`

  return (
    <DiffLink
      role="link"
      onClick={() => {
        navigate(path)
      }}
    >{`${method.name} for ${specKey}`}</DiffLink>
  )
}

interface DiffItemProps {
  item: DiffRow
  leftKey: string
  rightKey: string
  leftSpec: ApiModel
  rightSpec: ApiModel
}

export const DiffItem: FC<DiffItemProps> = ({
  item,
  leftKey,
  leftSpec,
  rightKey,
  rightSpec,
}) => {
  const alias = useSelector(selectSdkLanguage)
  const selectedSdkLanguage = getLanguageByAlias(alias)
  const [leftMethod, setLeftMethod] = useState<IMethod | undefined>(
    leftSpec.methods[item.name]
  )
  const [rightMethod, setRightMethod] = useState<IMethod | undefined>(
    rightSpec.methods[item.name]
  )
  const [method, setMethod] = useState<IMethod>((leftMethod || rightMethod)!)
  const [isOpen, setIsOpen] = useState(false)
  const [leftSide, setLeftSide] = useState<string>('')
  const [rightSide, setRightSide] = useState<string>('')

  useEffect(() => {
    const { lhs, rhs } = differ(item, leftSpec, rightSpec, selectedSdkLanguage)
    const lMethod = leftSpec.methods[item.name]
    const rMethod = rightSpec.methods[item.name]
    setLeftMethod(lMethod)
    setRightMethod(rMethod)
    setMethod((lMethod || rMethod)!)
    setLeftSide(lhs)
    setRightSide(rhs)
  }, [leftSpec, rightSpec, isOpen, selectedSdkLanguage])

  const handleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Card border width="100%">
      <Accordion2
        indicatorPosition="left"
        isOpen={isOpen}
        toggleOpen={handleOpen}
        label={<DiffBanner item={item} method={method} />}
      >
        <Grid columns={2}>
          <Box>
            <DiffMethodLink method={leftMethod} specKey={leftKey} />
          </Box>
          <Box>
            <DiffMethodLink method={rightMethod} specKey={rightKey} />
          </Box>
        </Grid>
        <ReactDiffViewer
          oldValue={leftSide}
          newValue={rightSide}
          splitView={true}
          compareMethod={DiffMethod.LINES}
          showDiffOnly={true}
        />
      </Accordion2>
    </Card>
  )
}
