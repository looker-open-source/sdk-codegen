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

import type { ValidationMessages } from '@looker/components';
import type { RootState } from '../root_reducer';
import type { IProjectProps } from '../../models';

export const getProjectsState = (state: RootState): IProjectProps[] =>
  state.projectsState.projects;

export const getCurrentProjectsState = (state: RootState): IProjectProps[] =>
  state.projectsState.currentProjects;

export const getProjectsLoadedState = (state: RootState): boolean =>
  state.projectsState.projectsLoaded;

export const getProjectsPageNumState = (state: RootState): number =>
  state.projectsState.currentPageNum;

export const getProjectState = (state: RootState): IProjectProps | undefined =>
  state.projectsState.currentProject;

export const getValidationMessagesState = (
  state: RootState
): ValidationMessages | undefined => state.projectsState.validationMessages;

export const getProjectUpdatedState = (state: RootState): boolean | undefined =>
  state.projectsState.projectUpdated;

export const getProjectLoadedState = (state: RootState): boolean =>
  state.projectsState.projectLoaded;

export const getIsProjectMemberState = (
  state: RootState
): boolean | undefined => state.projectsState.isProjectMember;
