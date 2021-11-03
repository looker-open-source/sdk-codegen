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

import type { FC } from 'react'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import type { ApiModel, SpecList } from '@looker/sdk-codegen'
import type { RunItSetter } from '@looker/run-it'
import type { IEnvironmentAdaptor } from '@looker/extension-utils'

import {
  HomeScene,
  MethodScene,
  MethodTagScene,
  TypeScene,
  TypeTagScene,
} from '../scenes'
import { DiffScene } from '../scenes/DiffScene'
import { diffPath } from '../utils'

interface AppRouterProps {
  api: ApiModel
  specKey: string
  specs: SpecList
  toggleNavigation: (target?: boolean) => void
  adaptor: IEnvironmentAdaptor
  setVersionsUrl: RunItSetter
}

export const AppRouter: FC<AppRouterProps> = ({
  specKey,
  api,
  specs,
  toggleNavigation,
  adaptor,
  setVersionsUrl,
}) => {
  return (
    <Switch>
      <Redirect from="/" to={`/${specKey}/`} exact />
      <Route path={`/${diffPath}/:l?/:r?`}>
        <DiffScene specs={specs} toggleNavigation={toggleNavigation} />
      </Route>
      <Route path="/:specKey/(methods|types)?" exact>
        <HomeScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag" exact>
        <MethodTagScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag/:methodName">
        <MethodScene
          api={api}
          adaptor={adaptor}
          setVersionsUrl={setVersionsUrl}
        />
      </Route>
      <Route path="/:specKey/types/:typeTag" exact>
        <TypeTagScene api={api} />
      </Route>
      <Route path="/:specKey/types/:typeTag/:typeName">
        <TypeScene api={api} />
      </Route>
    </Switch>
  )
}
