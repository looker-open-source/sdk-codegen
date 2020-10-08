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
  Header,
  useTabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@looker/components'
import { ProjectsScene } from '../ProjectsScene'

interface HomeSceneProps {}

export const HomeScene: FC<HomeSceneProps> = () => {
  // const { value, setOn, setOff } = useToggle()
  const tabs = useTabs()
  return (
    <>
      <Box>
        <Header>Looker Hack@Home</Header>
      </Box>
      <TabList {...tabs}>
        <Tab key="home">Home</Tab>
        <Tab key="admin">Admin</Tab>
        <Tab key="users">Users</Tab>
        <Tab key="projects">Projects</Tab>
        <Tab key="judging">Judging</Tab>
      </TabList>
      <TabPanels {...tabs}>
        <TabPanel key="home">Home page content goes here!</TabPanel>
        <TabPanel key="admin">Admin page goes here!</TabPanel>
        <TabPanel key="users">Users page goes here!</TabPanel>
        <TabPanel key="projects">
          <ProjectsScene />
        </TabPanel>
        <TabPanel key="judging">Judging page goes here!</TabPanel>
      </TabPanels>
    </>
  )
}
