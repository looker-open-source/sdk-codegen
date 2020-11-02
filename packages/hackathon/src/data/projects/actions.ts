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
import { IProjectProps, IHackerProps } from '../../models'

export enum Actions {
  ALL_PROJECTS_REQUEST = 'ALL_PROJECTS_REQUEST',
  ALL_PROJECTS_SUCCESS = 'ALL_PROJECTS_SUCCESS',
  CURRENT_PROJECTS_REQUEST = 'CURRENT_PROJECTS_REQUEST',
  CURRENT_PROJECTS_SUCCESS = 'CURRENT_PROJECTS_SUCCESS',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  CREATE_PROJECT = 'CREATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  LOCK_PROJECTS = 'LOCK_PROJECTS',
  CHANGE_MEMBERSHIP = 'CHANGE_MEMBERSHIP',
}

export interface AllProjectsRequestAction {
  type: Actions.ALL_PROJECTS_REQUEST
}

export interface AllProjectsSuccessAction {
  type: Actions.ALL_PROJECTS_SUCCESS
  payload: IProjectProps[]
}

export interface CurrentProjectsRequestAction {
  type: Actions.CURRENT_PROJECTS_REQUEST
}

export interface CurrentProjectsSuccessAction {
  type: Actions.CURRENT_PROJECTS_SUCCESS
  payload: IProjectProps[]
}

export interface UpdateProjectAction {
  type: Actions.UPDATE_PROJECT
  payload: {
    project: IProjectProps
    addedJudges: IHackerProps[]
    deletedJudges: IHackerProps[]
  }
}

export interface CreateProjectAction {
  type: Actions.CREATE_PROJECT
  payload: {
    hackerId: string
    project: IProjectProps
  }
}

export interface DeleteProjectAction {
  type: Actions.DELETE_PROJECT
  payload: {
    projectId: string
  }
}

export interface ChangeMembershipAction {
  type: Actions.CHANGE_MEMBERSHIP
  payload: {
    leave: boolean
    projectId: string
    hackerId: string
  }
}

export interface LockProjectsAction {
  type: Actions.LOCK_PROJECTS
  payload: {
    hackathonId?: string
    lock: boolean
  }
}

export type ProjectAction =
  | AllProjectsRequestAction
  | AllProjectsSuccessAction
  | CurrentProjectsRequestAction
  | CurrentProjectsSuccessAction
  | UpdateProjectAction
  | CreateProjectAction
  | DeleteProjectAction
  | LockProjectsAction
  | ChangeMembershipAction

export const allProjectsRequest = (): AllProjectsRequestAction => ({
  type: Actions.ALL_PROJECTS_REQUEST,
})

export const allProjectsSuccess = (
  projects: IProjectProps[]
): AllProjectsSuccessAction => ({
  type: Actions.ALL_PROJECTS_SUCCESS,
  payload: projects,
})

export const currentProjectsRequest = (): CurrentProjectsRequestAction => ({
  type: Actions.CURRENT_PROJECTS_REQUEST,
})

export const currentProjectsSuccess = (
  projects: IProjectProps[]
): CurrentProjectsSuccessAction => ({
  type: Actions.CURRENT_PROJECTS_SUCCESS,
  payload: projects,
})

export const updateProject = (
  project: IProjectProps,
  addedJudges: IHackerProps[],
  deletedJudges: IHackerProps[]
): UpdateProjectAction => ({
  type: Actions.UPDATE_PROJECT,
  payload: {
    project,
    addedJudges,
    deletedJudges,
  },
})

export const createProject = (
  hackerId: string,
  project: IProjectProps
): CreateProjectAction => ({
  type: Actions.CREATE_PROJECT,
  payload: {
    hackerId,
    project,
  },
})

export const deleteProject = (projectId: string): DeleteProjectAction => ({
  type: Actions.DELETE_PROJECT,
  payload: { projectId },
})

export const lockProjects = (
  lock: boolean,
  hackathonId?: string
): LockProjectsAction => ({
  type: Actions.LOCK_PROJECTS,
  payload: {
    hackathonId,
    lock,
  },
})

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
})
