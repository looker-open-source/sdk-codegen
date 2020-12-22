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
import styled from 'styled-components'
import {
  Card,
  Text,
  Heading,
  Divider,
  Link,
  Badge,
  Box,
  SpaceVertical,
  ButtonTransparent,
} from '@looker/components'
import { Scroller } from '../../components/Scroller'

export const HomeScene: FC = () => (
  <>
    <Box height="40px" />
    <Card width="50vw" height="75vh" raised>
      <Scroller>
        <SpaceVertical p="medium">
          <Heading color="secondary">Agenda — Oct 15</Heading>
          <Box>
            <Time width="100px">9:00am</Time>
            <Text> Welcome and Kickoff</Text>
          </Box>
          <Box>
            <Time>9:30am</Time>
            <Text> Supported Hacking Hours Begin</Text>
          </Box>
          <Box>
            <Time>10:30am</Time>
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
          <Box>
            <Time>1:00pm</Time>
            <Text> HandStandup & Stretch</Text>
            {/* <Badge mx="10px" intent="critical">Now</Badge> */}
          </Box>
          <Box>
            <Time>2:00pm</Time>
            <Text> Live feedback lounge</Text>
          </Box>
          <Box>
            <Time>3:00pm</Time>
            <Text> Supported Hacking Hours Close</Text>
          </Box>
          <Box>
            <Time>12:00am</Time>
            <Text> Midnight Hack Party (optional)</Text>
          </Box>
          <Divider appearance="dark" />
          <Heading color="secondary">Agenda — Oct 16</Heading>
          <Box>
            <Time>9:00am</Time>
            <Text> Day 2 Kickoff</Text>
          </Box>
          <Box>
            <Time>10:30am</Time>
            <Text> Live feedback lounge</Text>
          </Box>
          <Box>
            <Time>12:00pm PT</Time>
            <Text> Final submissions due</Text>
          </Box>
          <Box>
            <Time>12:05pm PT</Time>
            <Text> Final HandStandup & Stretch</Text>
          </Box>
          <Box>
            <Time>2:00pm PT</Time>
            <Text> Winner Announcements & Demos</Text>
          </Box>
          <Box>
            <Time>2:30pm PT</Time>
            <Text> Hacky Hour</Text>
          </Box>
        </SpaceVertical>
      </Scroller>
    </Card>
  </>
)

const Time = styled(ButtonTransparent)`
  width: 100px;
  margin-right: 20px;
`
