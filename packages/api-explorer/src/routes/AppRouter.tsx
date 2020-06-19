import React, { FC } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ApiModel } from '@looker/sdk-codegen'

import { HomeScene, MethodScene, TypeScene } from '../scenes'

interface AppRouterProps {
  api: ApiModel
  specKey: string
}

export const AppRouter: FC<AppRouterProps> = ({ specKey, api }) => (
  <Switch>
    <Redirect from="/" to={`/${specKey}/`} exact />
    <Route path="/:specKey/(methods|types)?" exact>
      <HomeScene api={api} />
    </Route>
    <Route path="/:specKey/methods/:methodTag/:methodName">
      <MethodScene api={api} />
    </Route>
    <Route path="/:specKey/types/:typeName">
      <TypeScene api={api} />
    </Route>
  </Switch>
)
