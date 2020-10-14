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
import React, { FC } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Hacker, Hackathon } from '../models'
import {
  HomeScene,
  UsersScene,
  JudgingScene,
  AdminScene,
  NotFoundScene,
  ProjectsScene,
  ProjectEditorScene,
} from '../scenes'
export enum Routes {
  HOME = '/home',
  ADMIN = '/admin',
  JUDGING = '/judging',
  PROJECTS = '/projects',
  CREATE_PROJECT = '/projects/new',
  EDIT_PROJECT = '/projects/:id',
  USERS = '/users',
}

export interface AppRouterProps {
  authorizedRoutes: Routes[]
}

export const getAuthorizedRoutes = (
  hacker?: Hacker,
  currentHackathon?: Hackathon
): Routes[] => {
  const authorizedRoutes: Routes[] = []
  if (hacker) {
    if (currentHackathon) {
      authorizedRoutes.push(Routes.HOME)
      authorizedRoutes.push(Routes.PROJECTS)
      authorizedRoutes.push(Routes.CREATE_PROJECT)
      authorizedRoutes.push(Routes.EDIT_PROJECT)
      if (hacker.canAdmin() || hacker.canJudge() || hacker.canStaff()) {
        authorizedRoutes.push(Routes.JUDGING)
      }
      if (hacker.canAdmin() || hacker.canStaff()) {
        authorizedRoutes.push(Routes.USERS)
      }
    }
    if (hacker.canAdmin()) {
      authorizedRoutes.push(Routes.ADMIN)
    }
  }
  return authorizedRoutes
}

export const AppRouter: FC<AppRouterProps> = ({ authorizedRoutes }) => (
  <Switch>
    {authorizedRoutes.includes(Routes.HOME) && (
      <Redirect from="/" to="/home" exact />
    )}
    {authorizedRoutes.includes(Routes.HOME) && (
      <Route path={Routes.HOME} exact>
        <HomeScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.ADMIN) && (
      <Route path={Routes.ADMIN}>
        <AdminScene />
      </Route>
    )}
    {authorizedRoutes.includes(Routes.JUDGING) && (
      <Route path={Routes.JUDGING}>
        <JudgingScene />
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
      <Route path={Routes.USERS} exact>
        <UsersScene />
      </Route>
    )}
    <Route>
      <NotFoundScene />
    </Route>
  </Switch>
)
