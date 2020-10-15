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
import React, { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tab, TabList, useTabs, TabPanels, TabPanel } from '@looker/components'
import { isLoadingState } from '../../data/common/selectors'
import { Loading } from '../../components/Loading'
import { allHackersRequest } from '../../data/hackers/actions'
import { getHackersState } from '../../data/hackers/selectors'
import { HackerList } from '../../components/HackerList'

interface UsersSceneProps {}

export const UsersScene: FC<UsersSceneProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(allHackersRequest())
  }, [dispatch])
  const hackers = useSelector(getHackersState)
  const isLoading = useSelector(isLoadingState)
  const tabs = useTabs()

  return (
    <>
      <Loading loading={isLoading} message={'Processing hackers...'} />
      {hackers && (
        <>
          <TabList {...tabs}>
            <Tab key="hackers">Hackers</Tab>
            <Tab key="staff">Staff</Tab>
            <Tab key="judges">Judges</Tab>
            <Tab key="admins">Admins</Tab>
          </TabList>
          <TabPanels px="xxlarge" {...tabs}>
            <TabPanel key="hackers">
              <HackerList hackers={hackers} list={hackers.users} />
            </TabPanel>
            <TabPanel key="staff">
              <HackerList hackers={hackers} list={hackers.staff} />
            </TabPanel>
            <TabPanel key="judges">
              <HackerList hackers={hackers} list={hackers.judges} />
            </TabPanel>
            <TabPanel key="admins">
              <HackerList hackers={hackers} list={hackers.admins} />
            </TabPanel>
          </TabPanels>
        </>
      )}
    </>
  )
}
