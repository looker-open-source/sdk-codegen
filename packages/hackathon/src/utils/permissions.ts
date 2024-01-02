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
  IHackerProps,
  IJudgingProps,
  IProjectProps,
  UserPermission,
} from '../models';

export const canDoProjectAction = (
  hacker: IHackerProps,
  project: IProjectProps,
  action: UserPermission
) => {
  return (
    hacker.canAdmin ||
    hacker.canJudge ||
    hacker.canStaff ||
    hacker.permissions.has(action) ||
    hacker.registration._id === project._user_id
  );
};

export const canUpdateProject = (
  hacker: IHackerProps,
  project?: IProjectProps,
  newProject?: boolean
): boolean => {
  if (hacker.canAdmin || hacker.canJudge || hacker.canStaff) {
    return true;
  }
  if (hacker.registration && hacker.registration._id) {
    if (
      newProject ||
      (project &&
        project?._user_id === hacker.registration._id &&
        !project.locked)
    ) {
      return true;
    }
  }
  return false;
};

export const canJoinProject = (
  hacker: IHackerProps,
  project?: IProjectProps
): boolean => {
  if (hacker.registration && hacker.registration._id) {
    if (project && project.project_type === 'Open' && !project.locked) {
      return true;
    }
  }
  return false;
};

export const canLockProject = (hacker: IHackerProps): boolean =>
  hacker.canAdmin || hacker.canJudge || hacker.canStaff;

export const canJudge = (
  hacker: IHackerProps,
  judging?: IJudgingProps
): boolean => {
  let canJudge = false;
  if (judging) {
    if (hacker.canAdmin || (hacker.canJudge && judging.user_id === hacker.id)) {
      canJudge = true;
    }
  }
  return canJudge;
};

export const canDoJudgingAction = (
  hacker: IHackerProps,
  judging: IJudgingProps
) => {
  return (
    hacker.canAdmin ||
    (hacker.canJudge && String(hacker.id) === judging.user_id)
  );
};
