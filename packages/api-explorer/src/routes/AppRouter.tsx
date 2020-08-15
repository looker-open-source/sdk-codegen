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
import React, { FC, useContext } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ApiModel } from '@looker/sdk-codegen'
import { RunItCallback, OAuthScene } from '@looker/run-it'

import { Looker40SDK, Looker31SDK } from '@looker/sdk/lib/browser'
import { HomeScene, MethodScene, TagScene, TypeScene } from '../scenes'
import { ExplorerContext, ExplorerContextProps } from '../context'

interface AppRouterProps {
  api: ApiModel
  specKey: string
  runItCallback?: RunItCallback
  sdk?: Looker31SDK | Looker40SDK
}

export const AppRouter: FC<AppRouterProps> = ({
  specKey,
  api,
  runItCallback,
  sdk,
}) => {
  const { runtimeEnvironment } = useContext<ExplorerContextProps>(
    ExplorerContext
  )
  return (
    <Switch>
      <Redirect from="/" to={`/${specKey}/`} exact />
      <Route path="/oauth">
        <OAuthScene sdk={sdk} configurator={runtimeEnvironment} />
      </Route>
      <Route path="/:specKey/(methods|types)?" exact>
        <HomeScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag" exact>
        <TagScene api={api} />
      </Route>
      <Route path="/:specKey/methods/:methodTag/:methodName">
        <MethodScene api={api} runItCallback={runItCallback} sdk={sdk} />
      </Route>
      <Route path="/:specKey/types/:typeName">
        <TypeScene api={api} />
      </Route>
    </Switch>
  )
}
