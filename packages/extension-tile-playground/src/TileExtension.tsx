/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useContext } from 'react';
import { ComponentsProvider } from '@looker/components';
import { Switch, Route } from 'react-router-dom';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import { MountPoint } from '@looker/extension-sdk';
import { VisualizationTile } from './components/VisualizationTile/VisualizationTile';
import { DashboardTile } from './components/DashboardTile/DashboardTile';
import { Inspector } from './components/Inspector/Inspector';
import { Unsupported } from './components/Unsupported/Unsupported';

const getDefaultRouteComponent = (mountPoint?: MountPoint) => {
  if (mountPoint === MountPoint.dashboardVisualization) {
    return <VisualizationTile />;
  }
  if (mountPoint === MountPoint.dashboardTilePopup) {
    // TODO create component specifically for dashboard tile popup
    return <VisualizationTile />;
  }
  if (mountPoint === MountPoint.dashboardTile) {
    return <DashboardTile />;
  }
  return <Unsupported mountPoint={mountPoint} />;
};

export const TileExtension: React.FC = () => {
  const { lookerHostData } = useContext(ExtensionContext40);

  return (
    <ComponentsProvider>
      <Switch>
        <Route path="/inspect">
          <Inspector />
        </Route>
        <Route>{getDefaultRouteComponent(lookerHostData?.mountPoint)}</Route>
      </Switch>
    </ComponentsProvider>
  );
};
