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
import React, { FC, useContext } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ApiModel, SpecList } from '@looker/sdk-codegen'
import { OAuthScene, RunItContext } from '@looker/run-it'

import { Looker40SDK } from '@looker/sdk'
import { HomeScene, MethodScene, TagScene, TypeScene } from '../scenes'
import { DiffScene } from '../scenes/DiffScene'
import { diffPath, oAuthPath } from '../utils'

interface AppRouterProps {
  api: ApiModel
  specKey: string
  specs: SpecList
  toggleNavigation: (target?: boolean) => void
}

export const AppRouter: FC<AppRouterProps> = ({
  specKey,
  api,
  specs,
  toggleNavigation,
}) => {
  const { sdk } = useContext(RunItContext)
  const maybeOauth = sdk && sdk instanceof Looker40SDK
  return (
    <Switch>
      <Redirect from="/" to={`/${specKey}/`} exact />
      {maybeOauth && (
        <Route path={`/${oAuthPath}`}>
          <OAuthScene />
        </Route>
      )}
      <Route path={`/${diffPath}/:l?/:r?`}>
        <DiffScene specs={specs} toggleNavigation={toggleNavigation} />
      </Route>
      <Route path="/:specKey/(methods|types)?" exact>
        <HomeScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag" exact>
        <TagScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag/:methodName">
        <MethodScene api={api} />
      </Route>
      <Route path="/:specKey/types/:typeName">
        <TypeScene api={api} />
      </Route>
    </Switch>
  )
}
