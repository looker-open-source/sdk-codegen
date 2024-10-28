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

import * as fs from 'fs';
import {
  Looker40SDK as LookerSDK,
  IDashboard,
  IRequestCreateDashboardRenderTask,
} from '@looker/sdk';
import { NodeSettingsIniFile, NodeSession } from '@looker/sdk-node';
import { getDashboard, rootIni, waitForRender } from './utils';

const localConfig = rootIni();

/**
 *
 * @type {NodeSettingsIniFile} Settings retrieved from the configuration file
 */
const settings = new NodeSettingsIniFile('', localConfig, 'Looker');

/**
 * Automatic authentication support for the Node SDK
 * @type {NodeSession} Initialized node-based session manager
 */
const session = new NodeSession(settings);

/**
 * Initialized SDK object
 * @type {LookerSDK} SDK object configured for use with Node
 */
const sdk = new LookerSDK(session);

/**
 * Read command-line parameters. Still have a bug for png argument
 * @returns {{dashboardTitle: string, renderFormat: string}}
 */
const getParams = () => {
  const offset = 1;
  return {
    dashboardTitle:
      process.argv.length > offset + 1 ? process.argv[offset + 1] : '',
    outputFormat:
      process.argv.length > offset + 2 ? process.argv[offset + 2] : 'pdf',
  };
};

/**
 * Download a dashboard using a render task
 * @param {LookerSDK} sdk initialized Looker SDK
 * @param {IDashboard} dashboard to download
 * @param {string} format format of rendering
 * @returns {Promise<undefined | string>} Name of file downloaded
 */
const downloadDashboard = async (
  sdk: LookerSDK,
  dashboard: IDashboard,
  format: string
) => {
  let fileName;
  try {
    const req: IRequestCreateDashboardRenderTask = {
      dashboard_id: dashboard.id!,
      result_format: format,
      body: {},
      width: 1920,
      height: 1080,
    };
    const task = await sdk.ok(sdk.create_dashboard_render_task(req));

    if (!task || !task.id) {
      console.error(`Could not create a render task for ${dashboard.title}`);
      return;
    }

    const result = await waitForRender(sdk, task.id!);
    if (result) {
      fileName = `${dashboard.title}.${format}`;
      fs.writeFile(fileName, result, 'binary', (err) => {
        if (err) {
          fileName = undefined;
          console.error(err);
        }
      });
    }
  } catch (err) {
    console.error(`'${format}' is probably not a valid format`);
    console.error(err);
  }
  return fileName;
};
(async () => {
  const { dashboardTitle, outputFormat } = getParams();
  if (!dashboardTitle) {
    console.warn('Please provide: <dashboardTitle> [<outputFormat>]');
    console.warn(
      '  outputFormat defaults to "pdf". png and jpg are also supported.'
    );
    return;
  }
  console.log(`Rendering dashboard "${dashboardTitle}" as ${outputFormat} ...`);

  const dashboard = await getDashboard(sdk, dashboardTitle);
  if (dashboard) {
    const fileName = await downloadDashboard(sdk, dashboard, outputFormat);
    console.log(`open "${fileName}" to see the download`);
  }

  await sdk.authSession.logout(); // logout of API session
  if (!sdk.authSession.isAuthenticated()) {
    console.log('Logout successful');
  }
})();
