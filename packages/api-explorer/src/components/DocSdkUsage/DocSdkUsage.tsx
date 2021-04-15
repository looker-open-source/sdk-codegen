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
import React, { FC, useContext } from 'react'
import {
  Card,
  Icon,
  Flex,
  FlexItem,
  Text,
  Divider,
  Link,
} from '@looker/components'
import { findExampleLanguages, IMethod } from '@looker/sdk-codegen'

import { CollapserCard } from '../Collapser'
import { LodeContext } from '../../context'
import { ExampleLinkTableRow, prepareExampleTableData } from './utils'

interface DocSdkUsageProps {
  method: IMethod
}

/**
 *  Given an SDK method, searches the examples index for its usages in various languages and renders
 *  links to the source files
 */
export const DocSdkUsage: FC<DocSdkUsageProps> = ({ method }) => {
  const { examples } = useContext(LodeContext)
  const languages = findExampleLanguages(examples, method.name)
  if (languages.length === 0) return <></>

  const tableExamples = prepareExampleTableData(
    languages,
    examples,
    method.operationId
  )

  return (
    <CollapserCard id="examples" heading="SDK Examples">
      <Card height="auto" p="medium" mt="small">
        <Flex alignItems="center" mx="medium" minHeight="2rem">
          <FlexItem flexBasis="50%">
            <Text fontWeight="semiBold">Filename</Text>
          </FlexItem>
          <FlexItem flexBasis="40%">
            <Text fontWeight="semiBold">Language</Text>
          </FlexItem>
          <FlexItem flexBasis="10%">
            <Text fontWeight="semiBold" style={{ float: 'right' }}>
              Line
            </Text>
          </FlexItem>
        </Flex>
        {tableExamples.map((exampleRow: ExampleLinkTableRow, i: number) => (
          <div key={i}>
            <Divider appearance="light" />
            <Flex alignItems="center" mx="medium" minHeight="2rem">
              <FlexItem flexBasis="2%">
                <Icon
                  style={{ float: 'right' }}
                  mr="small"
                  name="IdeFileGeneric"
                  color="text1"
                />
              </FlexItem>
              <FlexItem flexBasis="48%">
                <Link href={exampleRow.permalink} target={'_blank'} role="link">
                  {exampleRow.filename}
                </Link>
              </FlexItem>
              <FlexItem flexBasis="40%">
                <Text textTransform="lowercase">{exampleRow.language}</Text>
              </FlexItem>
              <FlexItem flexBasis="10%">
                <Text style={{ float: 'right' }}>{exampleRow.line}</Text>
              </FlexItem>
            </Flex>
          </div>
        ))}
      </Card>
    </CollapserCard>
  )
}
