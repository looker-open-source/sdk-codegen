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

import type {
  IHackathonProps,
  ITechnologyProps,
  IHackerProps,
} from '../../models';
import type { RootState } from '../root_reducer';
import type {
  ProjectsHeadings,
  HackersHeadings,
  JudgingsHeadings,
} from '../types';

export const getCurrentHackathonState = (
  state: RootState
): IHackathonProps | undefined => state.hackSessionState.currentHackathon;

export const getHackerState = (state: RootState): IHackerProps =>
  state.hackSessionState.hacker;

export const getHackerIdState = (state: RootState): string | undefined =>
  state.hackSessionState.hacker?.id;

export const getHackerRegistrationIdState = (
  state: RootState
): string | undefined => state.hackSessionState.hacker?.registration?._id;

export const getTechnologies = (
  state: RootState
): ITechnologyProps[] | undefined => state.hackSessionState.technologies;

export const getProjectsHeadings = (state: RootState): ProjectsHeadings =>
  state.hackSessionState.metadata.projectsHeadings;

export const getHackersHeadings = (state: RootState): HackersHeadings =>
  state.hackSessionState.metadata.hackersHeadings;

export const getJudgingsHeadings = (state: RootState): JudgingsHeadings =>
  state.hackSessionState.metadata.judgingsHeadings;
