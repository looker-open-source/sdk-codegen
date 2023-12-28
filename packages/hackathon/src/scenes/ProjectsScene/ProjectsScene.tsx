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
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Button,
  ButtonOutline,
  Space,
  Heading,
  Span,
  Icon,
} from '@looker/components';
import { Add } from '@styled-icons/material-outlined/Add';
import { Create } from '@styled-icons/material-outlined/Create';
import { Lock } from '@styled-icons/material-outlined/Lock';
import { ArrowDownward } from '@styled-icons/material/ArrowDownward';
import {
  currentProjectsRequest,
  lockProjects,
} from '../../data/projects/actions';
import { isLoadingState } from '../../data/common/selectors';
import { Loading } from '../../components';
import { Routes } from '../../routes';
import {
  getCurrentHackathonState,
  getHackerState,
} from '../../data/hack_session/selectors';
import { canLockProject } from '../../utils';
import { Era, eraColor, zonedLocaleDate } from '../HomeScene/components';
import { ProjectList } from './components';

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = () => {
  const dispatch = useDispatch();
  const hacker = useSelector(getHackerState);
  const hackathon = useSelector(getCurrentHackathonState);
  const isLoading = useSelector(isLoadingState);
  const history = useHistory();

  const handleAdd = () => {
    history.push(Routes.CREATE_PROJECT);
  };

  const handleLock = () => {
    if (hackathon) dispatch(lockProjects(true, hackathon._id));
  };

  const handleUnlock = () => {
    if (hackathon) dispatch(lockProjects(false, hackathon._id));
  };

  const handleReload = () => {
    dispatch(currentProjectsRequest());
  };

  let judgingStarted = false;
  let judgingString = '';
  if (hackathon && hacker) {
    judgingStarted = hackathon.judging_starts?.getTime() < new Date().getTime();

    const dateString = zonedLocaleDate(
      hackathon.judging_starts,
      hacker.timezone,
      hacker.locale
    );

    if (judgingStarted) {
      judgingString = `Judging started: ${dateString}`;
    } else {
      judgingString = `Judging starts: ${dateString}`;
    }
  }

  return (
    <>
      <Space>
        <Space>
          <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
            Projects{' '}
            <ButtonOutline onClick={handleReload}>Reload</ButtonOutline>
          </Heading>
          {isLoading && <Loading message={'Processing projects...'} />}
        </Space>
        <Span color={'inform'} style={{ whiteSpace: 'nowrap' }}>
          Project options
        </Span>
        <Icon color={'inform'} pr="u1" icon={<ArrowDownward />} />
      </Space>
      <ProjectList />
      <Space pt="xlarge">
        <Button
          iconBefore={<Add />}
          onClick={handleAdd}
          disabled={(isLoading || judgingStarted) && !canLockProject(hacker)}
        >
          Add Project
        </Button>
        <>
          {hackathon && hacker && hacker.canAdmin && (
            <>
              <Button
                iconBefore={<Lock />}
                onClick={handleLock}
                disabled={isLoading}
              >
                Lock Projects
              </Button>
              <Button
                iconBefore={<Create />}
                onClick={handleUnlock}
                disabled={isLoading}
              >
                Unlock Projects
              </Button>
            </>
          )}
        </>
        <Span color={eraColor(judgingStarted ? Era.past : Era.future)}>
          {judgingString}
        </Span>
      </Space>
    </>
  );
};
