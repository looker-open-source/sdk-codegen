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
import { Project } from '../../models'
import { ProjectAction, Actions } from './projectActions'

export interface ProjectState {
  loading: boolean
  error?: string
  projects?: Project[]
}

const defaultState: Readonly<ProjectState> = Object.freeze({
  loading: false,
})

export const projectsReducer = (
  state: ProjectState = defaultState,
  action: ProjectAction
): ProjectState => {
  switch (action.type) {
    case Actions.ALL_PROJECTS_REQUEST:
    // case ProjectActions.CREATE_PROJECT_REQUEST:
    // case ProjectActions.UPDATE_PROJECT_REQUEST:
    //   return {
    //     ...state,
    //     loading: true,
    //   }
    // case ProjectActions.ERROR:
    //   return {
    //     ...state,
    //     loading: false,
    //     error: action.payload as string,
    //   }
    default:
      return state
  }
}
