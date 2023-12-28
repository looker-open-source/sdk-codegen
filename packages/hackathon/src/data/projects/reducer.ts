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
import type { IProjectProps } from '../../models';
import type { ProjectAction } from './actions';
import { Actions } from './actions';

export interface ProjectsState {
  currentPageNum: number;
  projects: IProjectProps[];
  currentProjects: IProjectProps[];
  projectsLoaded: boolean;
  currentProject?: IProjectProps;
  isProjectMember?: boolean;
  validationMessages?: ValidationMessages;
  projectUpdated?: boolean;
  projectLoaded: boolean;
}

const defaultState: Readonly<ProjectsState> = Object.freeze({
  currentPageNum: 1,
  projects: [],
  currentProjects: [],
  projectsLoaded: false,
  projectLoaded: false,
});

export const projectsReducer = (
  state: ProjectsState = defaultState,
  action: ProjectAction
): ProjectsState => {
  switch (action.type) {
    case Actions.ALL_PROJECTS_REQUEST:
      return {
        ...state,
        currentProject: undefined,
        projectUpdated: undefined,
        projectLoaded: false,
      };
    case Actions.ALL_PROJECTS_RESPONSE:
      return {
        ...state,
        projects: action.payload,
        projectsLoaded: true,
      };
    case Actions.CURRENT_PROJECTS_REQUEST:
      return {
        ...state,
        currentProject: undefined,
        projectUpdated: undefined,
        projectLoaded: false,
      };
    case Actions.CURRENT_PROJECTS_RESPONSE:
      return {
        ...state,
        currentProjects: action.payload,
        projectsLoaded: true,
      };
    case Actions.GET_PROJECT_REQUEST:
      return {
        ...state,
        currentProject: undefined,
        validationMessages: undefined,
        projectUpdated: undefined,
        projectLoaded: false,
      };
    case Actions.GET_PROJECT_RESPONSE: {
      const { project, isProjectMember } = action.payload;
      return {
        ...state,
        currentProject: project,
        isProjectMember,
        projectLoaded: true,
      };
    }
    case Actions.UPDATE_PROJECT_DATA:
      return {
        ...state,
        currentProject: { ...action.payload },
      };
    case Actions.UPDATE_PROJECTS_PAGE_NUM:
      return {
        ...state,
        currentPageNum: action.payload,
      };
    case Actions.CREATE_PROJECT:
      return {
        ...state,
        validationMessages: undefined,
      };
    case Actions.SAVE_PROJECT_RESPONSE:
      return {
        ...state,
        currentProject: action.payload.project,
        validationMessages: action.payload.validationMessages,
        isProjectMember: action.payload.isProjectMember,
        projectUpdated: true,
      };
    default:
      return state;
  }
};
