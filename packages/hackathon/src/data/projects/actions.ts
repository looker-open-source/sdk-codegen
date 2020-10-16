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
import { Projects, Project, Hackathon, Hacker } from '../../models'

export enum Actions {
  ALL_PROJECTS_REQUEST = 'ALL_PROJECTS_REQUEST',
  ALL_PROJECTS_SUCCESS = 'ALL_PROJECTS_SUCCESS',
  CURRENT_PROJECTS_REQUEST = 'CURRENT_PROJECTS_REQUEST',
  CURRENT_PROJECTS_SUCCESS = 'CURRENT_PROJECTS_SUCCESS',
  BEGIN_EDIT_PROJECT_REQUEST = 'BEGIN_EDIT_PROJECT_REQUEST',
  BEGIN_EDIT_PROJECT_SUCCESS = 'BEGIN_EDIT_PROJECT_SUCCESS',
  SAVE_PROJECT_REQUEST = 'SAVE_PROJECT_REQUEST',
  SAVE_PROJECT_SUCCESS = 'SAVE_PROJECT_SUCCESS',
  DELETE_PROJECT_REQUEST = 'DELETE_PROJECT_REQUEST',
  DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS',
  LOCK_PROJECTS_REQUEST = 'LOCK_PROJECTS_REQUEST',
  LOCK_PROJECTS_SUCCESS = 'LOCK_PROJECTS_SUCCESS',
  CHANGE_MEMBERSHIP = 'CHANGE_MEMBERSHIP',
}

export interface AllProjectsRequestAction {
  type: Actions.ALL_PROJECTS_REQUEST
}

export interface AllProjectsSuccessAction {
  type: Actions.ALL_PROJECTS_SUCCESS
  payload: Projects
}

export interface CurrentProjectsRequestAction {
  type: Actions.CURRENT_PROJECTS_REQUEST
}

export interface CurrentProjectsSuccessAction {
  type: Actions.CURRENT_PROJECTS_SUCCESS
  payload: Projects
}

export interface BeginEditProjectRequestAction {
  type: Actions.BEGIN_EDIT_PROJECT_REQUEST
  payload: {
    projects: Projects
    project: Project
  }
}

export interface BeginEditProjectSuccessAction {
  type: Actions.BEGIN_EDIT_PROJECT_SUCCESS
}

export interface SaveProjectRequestAction {
  type: Actions.SAVE_PROJECT_REQUEST
  payload: {
    hacker_id: string
    projects: Projects
    project: Project
  }
}

export interface SaveProjectSuccessAction {
  type: Actions.SAVE_PROJECT_SUCCESS
}

export interface DeleteProjectRequestAction {
  type: Actions.DELETE_PROJECT_REQUEST
  payload: {
    projects: Projects
    project: Project
  }
}

export interface DeleteProjectSuccessAction {
  type: Actions.DELETE_PROJECT_SUCCESS
}

export interface ChangeMembershipAction {
  type: Actions.CHANGE_MEMBERSHIP
  payload: {
    leave: boolean
    project: Project
    hacker: Hacker
  }
}

export interface LockProjectsRequestAction {
  type: Actions.LOCK_PROJECTS_REQUEST
  payload: {
    projects: Projects
    hackathon: Hackathon
    lock: boolean
  }
}

export interface LockProjectsSuccessAction {
  type: Actions.LOCK_PROJECTS_SUCCESS
  payload: Projects
}

export type ProjectAction =
  | AllProjectsRequestAction
  | AllProjectsSuccessAction
  | CurrentProjectsRequestAction
  | CurrentProjectsSuccessAction
  | BeginEditProjectRequestAction
  | BeginEditProjectSuccessAction
  | SaveProjectRequestAction
  | SaveProjectSuccessAction
  | DeleteProjectRequestAction
  | DeleteProjectSuccessAction
  | LockProjectsRequestAction
  | LockProjectsSuccessAction
  | ChangeMembershipAction
  | ChangeMembershipSuccessAction

export const allProjectsRequest = (): AllProjectsRequestAction => ({
  type: Actions.ALL_PROJECTS_REQUEST,
})

export const allProjectsSuccess = (
  projects: Projects
): AllProjectsSuccessAction => ({
  type: Actions.ALL_PROJECTS_SUCCESS,
  payload: projects,
})

export const currentProjectsRequest = (): CurrentProjectsRequestAction => ({
  type: Actions.CURRENT_PROJECTS_REQUEST,
})

export const currentProjectsSuccess = (
  projects: Projects
): CurrentProjectsSuccessAction => ({
  type: Actions.CURRENT_PROJECTS_SUCCESS,
  payload: projects,
})

export const beginEditProjectRequest = (
  projects: Projects,
  project: Project
): BeginEditProjectRequestAction => ({
  type: Actions.BEGIN_EDIT_PROJECT_REQUEST,
  payload: {
    projects,
    project,
  },
})

export const beginEditProjectSuccess = (): BeginEditProjectSuccessAction => ({
  type: Actions.BEGIN_EDIT_PROJECT_SUCCESS,
})

export const saveProjectRequest = (
  hacker_id: string,
  projects: Projects,
  project: Project
): SaveProjectRequestAction => ({
  type: Actions.SAVE_PROJECT_REQUEST,
  payload: {
    hacker_id: hacker_id,
    projects: projects,
    project: project,
  },
})

export const saveProjectSuccess = (): SaveProjectSuccessAction => ({
  type: Actions.SAVE_PROJECT_SUCCESS,
})

export const deleteProjectRequest = (
  projects: Projects,
  project: Project
): DeleteProjectRequestAction => ({
  type: Actions.DELETE_PROJECT_REQUEST,
  payload: {
    project: project,
    projects: projects,
  },
})

export const deleteProjectSuccess = (): DeleteProjectSuccessAction => ({
  type: Actions.DELETE_PROJECT_SUCCESS,
})

export const lockProjectsRequest = (
  projects: Projects,
  hackathon: Hackathon,
  lock: boolean
): LockProjectsRequestAction => ({
  type: Actions.LOCK_PROJECTS_REQUEST,
  payload: {
    projects: projects,
    hackathon: hackathon,
    lock: lock,
  },
})

export const lockProjectsSuccess = (
  projects: Projects
): LockProjectsSuccessAction => ({
  type: Actions.LOCK_PROJECTS_SUCCESS,
  payload: projects,
})

export const changeMembership = (
  project: Project,
  hacker: Hacker,
  leave: boolean
): ChangeMembershipAction => ({
  type: Actions.CHANGE_MEMBERSHIP,
  payload: {
    project,
    hacker,
    leave,
  },
})
