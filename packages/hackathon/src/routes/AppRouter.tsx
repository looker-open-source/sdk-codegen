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
import type { FC } from 'react';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import type { IHackerProps, IHackathonProps } from '../models';
import {
  HomeScene,
  UsersScene,
  JudgingScene,
  JudgingEditorScene,
  AdminScene,
  NotFoundScene,
  ProjectsScene,
  ProjectEditorScene,
  ResourceScene,
} from '../scenes';

export enum Routes {
  HOME = '/home',
  ADMIN = '/admin',
  JUDGING = '/judging',
  EDIT_JUDGING = '/judging/:id',
  PROJECTS = '/projects',
  VIEW_PROJECT = '/projectview/:id',
  CREATE_PROJECT = '/projects/new',
  EDIT_PROJECT = '/projects/:id',
  USERS = '/users',
  RESOURCES = '/resources',
}

export interface AppRouterProps {
  hacker: IHackerProps;
  authorizedRoutes: Routes[];
}

export const getAuthorizedRoutes = (
  hacker?: IHackerProps,
  currentHackathon?: IHackathonProps
): Routes[] => {
  const authorizedRoutes: Routes[] = [];
  authorizedRoutes.push(Routes.HOME);
  authorizedRoutes.push(Routes.RESOURCES);
  if (hacker) {
    if (currentHackathon) {
      authorizedRoutes.push(Routes.PROJECTS);
      authorizedRoutes.push(Routes.VIEW_PROJECT);
      authorizedRoutes.push(Routes.CREATE_PROJECT);
      authorizedRoutes.push(Routes.EDIT_PROJECT);
      if (hacker.canAdmin || hacker.canJudge || hacker.canStaff) {
        authorizedRoutes.push(Routes.JUDGING);
        authorizedRoutes.push(Routes.EDIT_JUDGING);
      }
      if (hacker.canAdmin || hacker.canStaff) {
        authorizedRoutes.push(Routes.USERS);
      }
    }
    if (hacker.canAdmin) {
      authorizedRoutes.push(Routes.ADMIN);
    }
  }
  return authorizedRoutes;
};

export const AppRouter: FC<AppRouterProps> = ({ authorizedRoutes, hacker }) => (
  <Switch>
    {authorizedRoutes.length > 0 && (
      <Redirect
        from="/"
        to={authorizedRoutes.includes(Routes.HOME) ? Routes.HOME : Routes.ADMIN}
        exact
      />
    )}
    {authorizedRoutes.includes(Routes.HOME) && (
      <Route path={Routes.HOME} exact>
        <HomeScene hacker={hacker} />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.ADMIN) && (
      <Route path={Routes.ADMIN}>
        <AdminScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.JUDGING) && (
      <Route path={Routes.JUDGING} exact>
        <JudgingScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.EDIT_JUDGING) && (
      <Route path={Routes.EDIT_JUDGING}>
        <JudgingEditorScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.RESOURCES) && (
      <Route path={Routes.RESOURCES} exact>
        <ResourceScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.PROJECTS) && (
      <Route path={Routes.PROJECTS} exact>
        <ProjectsScene />
      </Route>
    )}

    {authorizedRoutes.includes(Routes.CREATE_PROJECT) && (
      <Route path={Routes.CREATE_PROJECT} exact>
        <ProjectEditorScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.EDIT_PROJECT) && (
      <Route path={Routes.EDIT_PROJECT} exact>
        <ProjectEditorScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.USERS) && (
      <Route path={Routes.USERS}>
        <UsersScene />
      </Route>
    )}
    {authorizedRoutes.length > 0 && (
      <Route>
        <NotFoundScene />
      </Route>
    )}
  </Switch>
);
