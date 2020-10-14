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
  Card,
  Text,
  Heading,
  Divider,
  Link,
  Badge,
  Box,
  Flex,
  FlexItem,
  SpaceVertical,
  ButtonTransparent,
} from '@looker/components'

export const HomeScene: FC = () => (
  <Card
    width="50vw"
    height="70vh"
    raised
    overflow="scroll"
    className="homesection"
  >
    <Flex flexDirection="column">
      {/* <FlexItem alignSelf="center" >
          <Heading textAlign="center" variant="subdued" fontSize="xxlarge">
            Agenda
          </Heading>
        </FlexItem> */}
      <Flex px="15" paddingTop="20px" flexDirection="column">
        <FlexItem>
          <Heading variant="secondary">Agenda — Oct 15</Heading>
          <SpaceVertical>
            <Box width="300px">
              <ButtonTransparent>9:00am</ButtonTransparent>
              <Text> Welcome and Kickoff</Text>
            </Box>
            <Box width="300px">
              <ButtonTransparent>9:30am</ButtonTransparent>
              <Text> Supported Hacking Hours Begin</Text>
            </Box>
            <Box width="500px">
              <ButtonTransparent>10:30am</ButtonTransparent>
              <Text> Jumpstart sessions broadcast</Text>
              <Link
                href="https://looker.com/events/join-2020#agenda"
                target="_blank"
              >
                <Badge mx="10px" intent="inform">
                  Re-watch
                </Badge>
              </Link>
            </Box>
            <Box width="500px">
              <ButtonTransparent>1:00pm</ButtonTransparent>
              <Text> HandStandup & Stretch</Text>
              {/* <Badge mx="10px" intent="critical">Now</Badge> */}
            </Box>
            <Box width="300px">
              <ButtonTransparent>2:00pm</ButtonTransparent>
              <Text> Live feedback lounge</Text>
            </Box>
            <Box width="300px">
              <ButtonTransparent>3:00pm</ButtonTransparent>
              <Text> Supported Hacking Hours Close</Text>
            </Box>
            <Box width="300px">
              <ButtonTransparent>12:00am</ButtonTransparent>
              <Text> Midnight Hack Party (optional)</Text>
            </Box>
          </SpaceVertical>
        </FlexItem>
        <Divider my="20px" mt="medium" appearance="dark" />
        <FlexItem>
          <Heading variant="secondary">Agenda — Oct 16</Heading>
          <SpaceVertical>
            <Box width="300px">
              <ButtonTransparent>9:00am</ButtonTransparent>
              <Text> Day 2 Kickoff</Text>
            </Box>
            <Box width="300px">
              <ButtonTransparent>10:30am</ButtonTransparent>
              <Text> Live feedback lounge</Text>
            </Box>
            <Box width="500px">
              <ButtonTransparent>12:00pm PT</ButtonTransparent>
              <Text> Final submissions due</Text>
              {/* <ButtonOutline mx="15" color="key">Submit Here</ButtonOutline> */}
            </Box>
            <Box width="400px">
              <ButtonTransparent>12:05pm PT</ButtonTransparent>
              <Text> Final HandStandup & Stretch</Text>
            </Box>
            <Box width="400px">
              <ButtonTransparent>2:00pm PT</ButtonTransparent>
              <Text> Winner Announcements & Demos</Text>
            </Box>
            <Box width="300px">
              <ButtonTransparent>2:30pm PT</ButtonTransparent>
              <Text> Hacky Hour</Text>
            </Box>
          </SpaceVertical>
        </FlexItem>
      </Flex>
    </Flex>
  </Card>
)
