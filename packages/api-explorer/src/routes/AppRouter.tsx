import React, { FC } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ApiModel } from '@looker/sdk-codegen'
import { TryItCallback } from '@looker/try-it'

import { HomeScene, MethodScene, TypeScene } from '../scenes'

interface AppRouterProps {
  api: ApiModel
  specKey: string
  tryItCallback?: TryItCallback
}

export const AppRouter: FC<AppRouterProps> = ({
  specKey,
  api,
  tryItCallback,
}) => (
  <Switch>
    <Redirect from="/" to={`/${specKey}/`} exact />
    <Route path="/:specKey/(methods|types)?" exact>
      <HomeScene api={api} />
    </Route>
    <Route path="/:specKey/methods/:methodTag/:methodName">
      <MethodScene api={api} tryItCallback={tryItCallback} />
    </Route>
    <Route path="/:specKey/types/:typeName">
      <TypeScene api={api} />
    </Route>
  </Switch>
)
