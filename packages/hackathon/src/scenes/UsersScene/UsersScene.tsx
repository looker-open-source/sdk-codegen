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
import type { FC } from 'react';
import React, { useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heading,
  Space,
  SpaceVertical,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from '@looker/components';
import { Routes } from '../../routes/AppRouter';
import { isLoadingState } from '../../data/common/selectors';
import { Loading } from '../../components/Loading';
import {
  allHackersRequest,
  updateHackersPageNum,
} from '../../data/hackers/actions';
import {
  getAdminsState,
  getHackersPageNumState,
  getHackersState,
  getJudgesState,
  getStaffState,
} from '../../data/hackers/selectors';
import { getTabInfo } from '../../utils';
import { HackerList } from './components/HackerList';

interface UsersSceneProps {}

const tabnames = ['hackers', 'staff', 'judges', 'admins'];

export const UsersScene: FC<UsersSceneProps> = () => {
  const history = useHistory();
  const match = useRouteMatch<{ func: string; tabname: string }>(
    '/:func/:tabname'
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(allHackersRequest());
  }, [dispatch]);
  const pageNum = useSelector(getHackersPageNumState);
  const hackers = useSelector(getHackersState);
  const staff = useSelector(getStaffState);
  const admins = useSelector(getAdminsState);
  const judges = useSelector(getJudgesState);
  const isLoading = useSelector(isLoadingState);
  const { tabIndex } = getTabInfo(tabnames, match?.params?.tabname);

  useEffect(() => {
    const currentTabname = match?.params?.tabname;
    const { tabname } = getTabInfo(tabnames, currentTabname);
    if (tabname !== currentTabname) {
      history.push(`${Routes.USERS}/${tabname}`);
    }
  }, [history, match]);

  const updatePageNum = (pageNum: number) => {
    dispatch(updateHackersPageNum(pageNum));
  };

  const onSelectTab = (index: number) => {
    const currentTabname = match?.params?.tabname;
    const tabname = tabnames[index];
    if (tabname !== currentTabname) {
      updateHackersPageNum(1);
      history.push(`${Routes.USERS}/${tabname}`);
    }
  };

  return (
    <>
      <Space>
        <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
          Users
        </Heading>
        {isLoading && <Loading message={'Processing users...'} />}
      </Space>
      {/* Tab components incorrectly sets content height causing unnecessary
      scrolling. Wrapping with SpaceVertical fixes this. TODO: Remove this hack
      once tab components are fixed. */}
      {hackers && (
        <SpaceVertical gap="none">
          <TabList selectedIndex={tabIndex} onSelectTab={onSelectTab}>
            <Tab key="hackers">Hackers</Tab>
            <Tab key="staff">Staff</Tab>
            <Tab key="judges">Judges</Tab>
            <Tab key="admins">Admins</Tab>
          </TabList>
          <TabPanels px="xxlarge" selectedIndex={tabIndex}>
            <TabPanel key="hackers">
              <HackerList
                hackers={hackers}
                pageNum={pageNum}
                updatePageNum={updatePageNum}
              />
            </TabPanel>
            <TabPanel key="staff">
              <HackerList
                hackers={staff}
                pageNum={pageNum}
                updatePageNum={updatePageNum}
              />
            </TabPanel>
            <TabPanel key="judges">
              <HackerList
                hackers={judges}
                pageNum={pageNum}
                updatePageNum={updatePageNum}
              />
            </TabPanel>
            <TabPanel key="admins">
              <HackerList
                hackers={admins}
                pageNum={pageNum}
                updatePageNum={updatePageNum}
              />
            </TabPanel>
          </TabPanels>
        </SpaceVertical>
      )}
    </>
  );
};
