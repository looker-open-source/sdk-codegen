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
  IHackerProps,
  ITechnologyProps,
} from '../../models';
import type {
  HackersHeadings,
  JudgingsHeadings,
  ProjectsHeadings,
} from '../types';

export enum Actions {
  INIT_HACK_SESSION_REQUEST = 'INIT_HACK_SESSION_REQUEST',
  INIT_HACK_SESSION_RESPONSE = 'INIT_HACK_SESSION_RESPONSE',
  INIT_HACK_SESSION_FAILURE = 'INIT_HACK_SESSION_FAILURE',
}

export interface InitHackSessionRequestAction {
  type: Actions.INIT_HACK_SESSION_REQUEST;
}

export interface InitHackSessionPayload {
  currentHackathon: IHackathonProps;
  technologies: ITechnologyProps[];
  hacker: IHackerProps;
  projectsHeadings: ProjectsHeadings;
  hackersHeadings: HackersHeadings;
  judgingsHeadings: JudgingsHeadings;
}

export interface InitHackFailurePayload {
  hacker: IHackerProps;
}

export interface InitHackSessionResponseAction {
  type: Actions.INIT_HACK_SESSION_RESPONSE;
  payload: InitHackSessionPayload;
}

export interface InitHackSessionFailureAction {
  type: Actions.INIT_HACK_SESSION_FAILURE;
  payload: InitHackFailurePayload;
}

export type HackSessionAction =
  | InitHackSessionRequestAction
  | InitHackSessionResponseAction
  | InitHackSessionFailureAction;

export const initHackSessionRequest = (): InitHackSessionRequestAction => ({
  type: Actions.INIT_HACK_SESSION_REQUEST,
});

export const initHackSessionResponse = (
  currentHackathon: IHackathonProps,
  technologies: ITechnologyProps[],
  hacker: IHackerProps,
  projectsHeadings: ProjectsHeadings,
  hackersHeadings: HackersHeadings,
  judgingsHeadings: JudgingsHeadings
): InitHackSessionResponseAction => ({
  type: Actions.INIT_HACK_SESSION_RESPONSE,
  payload: {
    currentHackathon,
    technologies,
    hacker,
    projectsHeadings,
    hackersHeadings,
    judgingsHeadings,
  },
});

export const initHackSessionFailure = (
  hacker: IHackerProps
): InitHackSessionFailureAction => ({
  type: Actions.INIT_HACK_SESSION_FAILURE,
  payload: { hacker },
});
