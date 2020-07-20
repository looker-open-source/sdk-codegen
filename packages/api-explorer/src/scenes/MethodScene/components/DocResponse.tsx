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

import React, { FC } from 'react'
import {
  Box,
  MessageBar,
  SpaceVertical,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableHead,
  TableRow,
  useTabs,
} from '@looker/components'
import { IMethodResponse } from '@looker/sdk-codegen'

import { ApixHeading, DocCode } from '../../../components'
import { copyAndCleanResponse } from '../utils'

interface DocResponseProps {
  responses: IMethodResponse[]
}

export const DocResponse: FC<DocResponseProps> = ({ responses }) => {
  const tabs = useTabs()

  return (
    <Box pt="large" pb="xxlarge">
      <SpaceVertical mb="medium">
        <ApixHeading as="h2">Responses</ApixHeading>
      </SpaceVertical>
      <TabList {...tabs}>
        {responses.map((response, index) => (
          <Tab
            key={index}
          >{`${response.statusCode}:${response.description}`}</Tab>
        ))}
      </TabList>
      <TabPanels {...tabs} pt="0">
        {responses.map((response, index) => (
          <TabPanel key={index}>
            <Table>
              <TableHead>
                <TableRow>
                  <SpaceVertical py="small">
                    <MessageBar intent="inform">
                      {response.statusCode}: {response.description}{' '}
                      {response.mediaType}
                    </MessageBar>
                  </SpaceVertical>
                </TableRow>
              </TableHead>
            </Table>
            <DocCode
              code={JSON.stringify(copyAndCleanResponse(response), null, 2)}
            />
          </TabPanel>
        ))}
      </TabPanels>
    </Box>
  )
}
