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

export enum Actions {
  ALL_PROJECTS_REQUEST = 'ALL_PROJECTS_REQUEST',
  ALL_PROJECTS_RESPONSE = 'ALL_PROJECTS_RESPONSE',
  CURRENT_PROJECTS_REQUEST = 'CURRENT_PROJECTS_REQUEST',
  CURRENT_PROJECTS_RESPONSE = 'CURRENT_PROJECTS_RESPONSE',
  GET_PROJECT_REQUEST = 'GET_PROJECT_REQUEST',
  GET_PROJECT_RESPONSE = 'GET_PROJECT_RESPONSE',
  UPDATE_PROJECT_DATA = 'UPDATE_PROJECT_DATA',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  CREATE_PROJECT = 'CREATE_PROJECT',
  SAVE_PROJECT_RESPONSE = 'SAVE_PROJECT_RESPONSE',
  DELETE_PROJECT = 'DELETE_PROJECT',
  LOCK_PROJECTS = 'LOCK_PROJECTS',
  LOCK_PROJECT = 'LOCK_PROJECT',
  CHANGE_MEMBERSHIP = 'CHANGE_MEMBERSHIP',
  UPDATE_PROJECTS_PAGE_NUM = 'UPDATE_PROJECTS_PAGE_NUM',
  SET_MORE_INFO = 'SET_MORE_INFO',
}

export interface AllProjectsRequestAction {
  type: Actions.ALL_PROJECTS_REQUEST;
}

export interface AllProjectsResponseAction {
  type: Actions.ALL_PROJECTS_RESPONSE;
  payload: IProjectProps[];
}

export interface CurrentProjectsRequestAction {
  type: Actions.CURRENT_PROJECTS_REQUEST;
}

export interface CurrentProjectsResponseAction {
  type: Actions.CURRENT_PROJECTS_RESPONSE;
  payload: IProjectProps[];
}

export interface GetProjectRequestAction {
  type: Actions.GET_PROJECT_REQUEST;
  payload?: string;
}

export interface GetProjectResponseAction {
  type: Actions.GET_PROJECT_RESPONSE;
  payload: { project?: IProjectProps; isProjectMember?: boolean };
}

export interface UpdateProjectDataAction {
  type: Actions.UPDATE_PROJECT_DATA;
  payload: IProjectProps;
}

export interface UpdateProjectAction {
  type: Actions.UPDATE_PROJECT;
  payload: IProjectProps;
}

export interface UpdateProjectsPageNumAction {
  type: Actions.UPDATE_PROJECTS_PAGE_NUM;
  payload: number;
}

export interface CreateProjectAction {
  type: Actions.CREATE_PROJECT;
  payload: {
    hackerId: string;
    project: IProjectProps;
  };
}

export interface SaveProjectResponseAction {
  type: Actions.SAVE_PROJECT_RESPONSE;
  payload: {
    project: IProjectProps;
    validationMessages?: ValidationMessages;
    isProjectMember?: boolean;
  };
}

export interface DeleteProjectAction {
  type: Actions.DELETE_PROJECT;
  payload: {
    projectId: string;
  };
}

export interface ChangeMembershipAction {
  type: Actions.CHANGE_MEMBERSHIP;
  payload: {
    leave: boolean;
    projectId: string;
    hackerId: string;
  };
}

export interface LockProjectsAction {
  type: Actions.LOCK_PROJECTS;
  payload: {
    hackathonId?: string;
    lock: boolean;
  };
}

export interface LockProjectAction {
  type: Actions.LOCK_PROJECT;
  payload: {
    projectId: string;
    lock: boolean;
  };
}

export type ProjectAction =
  | AllProjectsRequestAction
  | AllProjectsResponseAction
  | CurrentProjectsRequestAction
  | CurrentProjectsResponseAction
  | GetProjectRequestAction
  | GetProjectResponseAction
  | UpdateProjectDataAction
  | UpdateProjectAction
  | CreateProjectAction
  | DeleteProjectAction
  | SaveProjectResponseAction
  | LockProjectsAction
  | LockProjectAction
  | ChangeMembershipAction
  | UpdateProjectsPageNumAction;

export const allProjectsRequest = (): AllProjectsRequestAction => ({
  type: Actions.ALL_PROJECTS_REQUEST,
});

export const allProjectsResponse = (
  projects: IProjectProps[]
): AllProjectsResponseAction => ({
  type: Actions.ALL_PROJECTS_RESPONSE,
  payload: projects,
});

export const currentProjectsRequest = (): CurrentProjectsRequestAction => ({
  type: Actions.CURRENT_PROJECTS_REQUEST,
});

export const currentProjectsResponse = (
  projects: IProjectProps[]
): CurrentProjectsResponseAction => ({
  type: Actions.CURRENT_PROJECTS_RESPONSE,
  payload: projects,
});

export const getProjectRequest = (
  projectId?: string
): GetProjectRequestAction => ({
  type: Actions.GET_PROJECT_REQUEST,
  payload: projectId,
});

export const getProjectResponse = (
  project?: IProjectProps,
  isProjectMember?: boolean
): GetProjectResponseAction => ({
  type: Actions.GET_PROJECT_RESPONSE,
  payload: { project, isProjectMember },
});

export const updateProjectData = (
  project: IProjectProps
): UpdateProjectDataAction => ({
  type: Actions.UPDATE_PROJECT_DATA,
  payload: project,
});

export const updateProjectsPageNum = (
  pageNum: number
): UpdateProjectsPageNumAction => ({
  type: Actions.UPDATE_PROJECTS_PAGE_NUM,
  payload: pageNum,
});

export const updateProject = (project: IProjectProps): UpdateProjectAction => ({
  type: Actions.UPDATE_PROJECT,
  payload: project,
});

export const saveProjectResponse = (
  project: IProjectProps,
  isProjectMember?: boolean,
  validationMessages?: ValidationMessages
): SaveProjectResponseAction => ({
  type: Actions.SAVE_PROJECT_RESPONSE,
  payload: { project, validationMessages, isProjectMember },
});

export const createProject = (
  hackerId: string,
  project: IProjectProps
): CreateProjectAction => ({
  type: Actions.CREATE_PROJECT,
  payload: {
    hackerId,
    project,
  },
});

export const deleteProject = (projectId: string): DeleteProjectAction => ({
  type: Actions.DELETE_PROJECT,
  payload: { projectId },
});

export const lockProjects = (
  lock: boolean,
  hackathonId?: string
): LockProjectsAction => ({
  type: Actions.LOCK_PROJECTS,
  payload: {
    hackathonId,
    lock,
  },
});

export const lockProject = (
  lock: boolean,
  projectId: string
): LockProjectAction => ({
  type: Actions.LOCK_PROJECT,
  payload: {
    projectId,
    lock,
  },
});

export const changeMembership = (
  projectId: string,
  hackerId: string,
  leave: boolean
): ChangeMembershipAction => ({
  type: Actions.CHANGE_MEMBERSHIP,
  payload: {
    projectId,
    hackerId,
    leave,
  },
});
