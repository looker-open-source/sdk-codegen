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
import { Projects, Project } from '../../models'

export enum Actions {
  ALL_PROJECTS_REQUEST = 'ALL_PROJECTS_REQUEST',
  ALL_PROJECTS_SUCCESS = 'ALL_PROJECTS_SUCCESS',
  BEGIN_EDIT_PROJECT_REQUEST = 'BEGIN_EDIT_PROJECT_REQUEST',
  BEGIN_EDIT_PROJECT_SUCCESS = 'BEGIN_EDIT_PROJECT_SUCCESS',
  SAVE_PROJECT_REQUEST = 'SAVE_PROJECT_REQUEST',
  SAVE_PROJECT_SUCCESS = 'SAVE_PROJECT_SUCCESS',
  DELETE_PROJECT_REQUEST = 'DELETE_PROJECT_REQUEST',
  DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS',
  ERROR = 'ERROR',
}

export interface AllProjectsRequestAction {
  type: Actions.ALL_PROJECTS_REQUEST
}

export interface AllProjectsSuccessAction {
  type: Actions.ALL_PROJECTS_SUCCESS
  payload: Projects
}

export interface BeginEditProjectRequestAction {
  type: Actions.BEGIN_EDIT_PROJECT_REQUEST
  payload?: string
}

export interface BeginEditProjectSuccessAction {
  type: Actions.BEGIN_EDIT_PROJECT_SUCCESS
  payload: Project
}

export interface SaveProjectRequestAction {
  type: Actions.SAVE_PROJECT_REQUEST
  payload: Project
}

export interface SaveProjectSuccessAction {
  type: Actions.SAVE_PROJECT_SUCCESS
}

export interface DeleteProjectRequestAction {
  type: Actions.DELETE_PROJECT_REQUEST
  payload: Project
}

export interface DeleteProjectSuccessAction {
  type: Actions.DELETE_PROJECT_SUCCESS
}

export type ProjectAction =
  | AllProjectsRequestAction
  | AllProjectsSuccessAction
  | BeginEditProjectRequestAction
  | BeginEditProjectSuccessAction
  | SaveProjectRequestAction
  | SaveProjectSuccessAction
  | DeleteProjectRequestAction
  | DeleteProjectSuccessAction

export const allProjectsRequest = (): AllProjectsRequestAction => ({
  type: Actions.ALL_PROJECTS_REQUEST,
})

export const allProjectsSuccess = (
  projects: Projects
): AllProjectsSuccessAction => ({
  type: Actions.ALL_PROJECTS_SUCCESS,
  payload: projects,
})

export const beginEditProjectRequest = (
  id?: string
): BeginEditProjectRequestAction => ({
  type: Actions.BEGIN_EDIT_PROJECT_REQUEST,
  payload: id,
})

export const beginEditProjectSuccess = (
  project: Project
): BeginEditProjectSuccessAction => ({
  type: Actions.BEGIN_EDIT_PROJECT_SUCCESS,
  payload: project,
})

export const saveProjectRequest = (
  project: Project
): SaveProjectRequestAction => ({
  type: Actions.SAVE_PROJECT_REQUEST,
  payload: project,
})

export const saveProjectSuccess = (): SaveProjectSuccessAction => ({
  type: Actions.SAVE_PROJECT_SUCCESS,
})

export const deleteProjectRequest = (
  project: Project
): DeleteProjectRequestAction => ({
  type: Actions.DELETE_PROJECT_REQUEST,
  payload: project,
})

export const deleteProjectSuccess = (): DeleteProjectSuccessAction => ({
  type: Actions.DELETE_PROJECT_SUCCESS,
})
