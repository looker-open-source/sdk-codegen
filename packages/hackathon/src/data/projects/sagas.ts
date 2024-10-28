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
import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { IProjectProps } from '../../models';
import { actionMessage, beginLoading, endLoading } from '../common/actions';
import { sheetsClient } from '../sheets_client';
import type {
  ChangeMembershipAction,
  CreateProjectAction,
  DeleteProjectAction,
  GetProjectRequestAction,
  LockProjectAction,
  LockProjectsAction,
  UpdateProjectAction,
} from './actions';
import {
  Actions,
  allProjectsResponse,
  currentProjectsRequest,
  currentProjectsResponse,
  getProjectResponse,
  saveProjectResponse,
} from './actions';
import { getCurrentProjectsState, getIsProjectMemberState } from './selectors';

const createNewProject = (): IProjectProps => {
  const newProject: unknown = {
    title: '',
    description: `ADD SHORT ONE PARAGRAPH OVERVIEW HERE

<!-- Fill out additional details below -->
- Team name: **My fabulous team**
- [Demo video link](https://youtube.com) <!--Required pre-recorded demo video link. 3 minutes max. Youtube only-->
- [Working demo link](https://looker.com) <!--Optional-->
  - <!--Provide any instructions in sub bullet for someone to run the demo.-->
- [Demo slides](https://slides.google.com)<!--Optional-->    
`,
    project_type: 'Open',
    contestant: true,
    locked: false,
    technologies: [],
    more_info: '',
    $team: [],
    $members: [],
    $judges: [],
  };
  return newProject as IProjectProps;
};

function* allProjectsSaga(): SagaIterator {
  try {
    yield put(beginLoading());
    const result = yield call([sheetsClient, sheetsClient.getProjects]);
    yield put(endLoading());
    yield put(allProjectsResponse(result));
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
}

function* currentProjectsSaga(): SagaIterator<IProjectProps[]> {
  let projects: IProjectProps[] = [];
  try {
    yield put(beginLoading());
    projects = yield call([sheetsClient, sheetsClient.getCurrentProjects]);
    yield put(currentProjectsResponse(projects));
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
  return projects;
}

function* getProjectSaga({
  payload: projectId,
}: GetProjectRequestAction): SagaIterator {
  try {
    if (!projectId) {
      // For new projects initialize empty project props
      yield put(getProjectResponse(createNewProject(), false));
    } else {
      // Pull prpjects out of state.
      const state = yield select();
      let projects = getCurrentProjectsState(state);
      if (projects.length === 0) {
        // projects are lost on page reload so load them
        projects = yield currentProjectsSaga() as any;
      }
      const project = projects.find(p => p._id === projectId);
      let isProjectMember;
      if (project) {
        const hacker = yield call([sheetsClient, sheetsClient.getHacker]);
        isProjectMember = !!project.$team.find(
          teamMember => teamMember.user_id === String(hacker.id)
        );
      }
      yield put(getProjectResponse(project, isProjectMember));
    }
  } catch (err) {
    console.error(err);
    yield put(actionMessage('A problem occurred loading the data', 'critical'));
  }
}

function* createProjectSaga(action: CreateProjectAction): SagaIterator<void> {
  try {
    const { project, hackerId } = action.payload;
    yield put(beginLoading());
    const validationMessages = yield call(
      [sheetsClient, sheetsClient.validateProject],
      project
    );
    const state = yield select();
    const isProjectMember = getIsProjectMemberState(state);
    if (validationMessages) {
      yield put(
        saveProjectResponse(project, isProjectMember, validationMessages)
      );
      yield put(actionMessage('Please fix errors', 'critical'));
    } else {
      const projectId = yield call(
        [sheetsClient, sheetsClient.createProject],
        hackerId,
        project
      );
      const updatedProject = yield call(
        [sheetsClient, sheetsClient.getProject],
        projectId
      );
      yield put(saveProjectResponse(updatedProject, isProjectMember));
      yield put(actionMessage('Project has been saved', 'positive'));
    }
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(
      actionMessage('A problem occurred while saving the project', 'critical')
    );
  }
}

function* updateProjectSaga(action: UpdateProjectAction): SagaIterator {
  try {
    yield put(beginLoading());

    const project = action.payload;
    const validationMessages = yield call(
      [sheetsClient, sheetsClient.validateProject],
      project
    );
    const state = yield select();
    const isProjectMember = getIsProjectMemberState(state);
    if (validationMessages) {
      yield put(
        saveProjectResponse(project, isProjectMember, validationMessages)
      );
      yield put(actionMessage('Please fix errors', 'critical'));
    } else {
      yield call([sheetsClient, sheetsClient.updateProject], project);
      const updatedProject = yield call(
        [sheetsClient, sheetsClient.getProject],
        project._id
      );
      yield put(saveProjectResponse(updatedProject, isProjectMember));
      yield put(actionMessage('Project has been saved', 'positive'));
    }
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(
      actionMessage('A problem occurred while editing the project', 'critical')
    );
  }
}

function* deleteProjectSaga(action: DeleteProjectAction) {
  try {
    yield put(beginLoading());
    yield call(
      [sheetsClient, sheetsClient.deleteProject],
      action.payload.projectId
    );
    yield put(actionMessage('Project has been deleted', 'positive'));
    yield put(currentProjectsRequest());
  } catch (err) {
    console.error(err);
    yield put(
      actionMessage('A problem occurred while deleting the project', 'critical')
    );
  }
}

function* lockProjectsSaga(action: LockProjectsAction) {
  try {
    const { lock, hackathonId } = action.payload;
    yield put(beginLoading());
    yield call([sheetsClient, sheetsClient.lockProjects], lock, hackathonId);
    yield put(
      actionMessage(
        `Projects have been ${lock ? 'locked' : 'unlocked'}`,
        'positive'
      )
    );
    yield put(currentProjectsRequest());
  } catch (err) {
    console.error(err);
    yield put(
      actionMessage(
        'A problem occurred while locking the hackathon projects',
        'critical'
      )
    );
  }
}

function* lockProjectSaga(action: LockProjectAction): SagaIterator {
  try {
    const { lock, projectId } = action.payload;
    yield put(beginLoading());
    const state = yield select();
    const isProjectMember = getIsProjectMemberState(state);
    yield call([sheetsClient, sheetsClient.lockProject], lock, projectId);
    const updatedProject = yield call(
      [sheetsClient, sheetsClient.getProject],
      projectId
    );
    yield put(saveProjectResponse(updatedProject, isProjectMember));
    yield put(
      actionMessage(
        `Project has been ${lock ? 'locked' : 'unlocked'}`,
        'positive'
      )
    );
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(
      actionMessage('A problem occurred while locking the project', 'critical')
    );
  }
}

function* changeMembershipSaga(action: ChangeMembershipAction): SagaIterator {
  try {
    yield put(beginLoading());
    const { projectId, hackerId, leave } = action.payload;
    const project = yield call(
      [sheetsClient, sheetsClient.changeMembership],
      projectId,
      hackerId,
      leave
    );
    yield put(saveProjectResponse(project, !leave));
    const projects = yield call([
      sheetsClient,
      sheetsClient.getCurrentProjects,
    ]);
    yield put(currentProjectsResponse(projects));
    yield put(
      actionMessage(
        `You have ${leave ? 'left' : 'joined'} the project`,
        'positive'
      )
    );
    yield put(endLoading());
  } catch (err) {
    console.error(err);
    yield put(actionMessage((err as Error).message, 'critical'));
  }
}

export function* registerProjectsSagas() {
  yield all([
    takeEvery(Actions.ALL_PROJECTS_REQUEST, allProjectsSaga),
    takeEvery(Actions.CURRENT_PROJECTS_REQUEST, currentProjectsSaga),
    takeEvery(Actions.GET_PROJECT_REQUEST, getProjectSaga),
    takeEvery(Actions.CREATE_PROJECT, createProjectSaga),
    takeEvery(Actions.UPDATE_PROJECT, updateProjectSaga),
    takeEvery(Actions.DELETE_PROJECT, deleteProjectSaga),
    takeEvery(Actions.LOCK_PROJECTS, lockProjectsSaga),
    takeEvery(Actions.LOCK_PROJECT, lockProjectSaga),
    takeEvery(Actions.CHANGE_MEMBERSHIP, changeMembershipSaga),
  ]);
}
