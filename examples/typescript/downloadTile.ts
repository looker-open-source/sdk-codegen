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
import { Readable } from 'stream';
import {
  Looker40SDK as LookerSDK,
  IDashboardElement,
  IRequestRunQuery,
  Looker40SDKStream,
} from '@looker/sdk';
import { NodeSettingsIniFile, NodeSession } from '@looker/sdk-node';
import {
  getDashboard,
  getDashboardTile,
  rootIni,
  waitForRender,
} from './utils';

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
 * @returns {{dashboardTitle: string, tileTitle: string, renderFormat: string}}
 */
const getParams = () => {
  const offset = 1;
  return {
    dashboardTitle:
      process.argv.length > offset + 1 ? process.argv[offset + 1] : '',
    tileTitle: process.argv.length > offset + 2 ? process.argv[offset + 2] : '',
    outputFormat:
      process.argv.length > offset + 3 ? process.argv[offset + 3] : 'png',
  };
};

/**
 * Is this format renderable?
 * @param {string} format to render
 * @returns {boolean} true if render_task can be used for this format
 */
const isRenderable = (format: string) => {
  format = format.toLowerCase();
  return format === 'png' || format === 'jpg';
};

/**
 * Renders a dashboard tile's query as PNG or JPG
 * @param {LookerSDK} sdk object to use
 * @param {IDashboardElement} tile to render (using query_id)
 * @param {string} format either png or jpg
 * @param {number} width defaults to 640
 * @param {number} height defaults to 480
 * @returns {Promise<string>} name of downloaded file (undefined on failure)
 *
 * **Note:** run_query can also be used for PNG and JPG output, but this function will show an elapsed time ticker via
 * the `waitForRender()` callback as the render is progressing
 */
const renderTile = async (
  sdk: LookerSDK,
  tile: IDashboardElement,
  format: string,
  width = 640,
  height = 480
) => {
  let fileName;
  const task = await sdk.ok(
    sdk.create_query_render_task(tile.query_id!, format, width, height)
  );

  if (!task || !task.id) {
    throw new Error(`Could not create a render task for ${tile.title}`);
  }

  const result = await waitForRender(sdk, task.id!);
  if (result) {
    fileName = `${tile.title}.${format}`;
    fs.writeFile(fileName, result, 'binary', (err) => {
      if (err) {
        fileName = undefined; // no file was created
        throw err;
      }
    });
  }
  return fileName;
};

/**
 * Use the streaming SDK to download a tile's query
 * @param {LookerSDK} sdk to use
 * @param {IDashboardElement} tile to download
 * @param {string} format to download
 * @returns {Promise<string>} name of downloaded file (undefined on failure)
 */
const downloadTileAs = async (
  sdk: LookerSDK,
  tile: IDashboardElement,
  format: string
) => {
  let fileName;
  fileName = `${tile.title}.${format}`;

  const writer = fs.createWriteStream(fileName);
  const request: IRequestRunQuery = {
    result_format: format,
    query_id: tile.query_id!,
    // apply_formatting: true,
    // apply_vis: true
  };
  const sdkStream = new Looker40SDKStream(sdk.authSession);
  await sdkStream.run_query(async (readable: Readable) => {
    return new Promise<any>((resolve, reject) => {
      readable
        .pipe(writer)
        .on('error', () => {
          fileName = undefined;
          throw reject;
        })
        .on('finish', resolve);
    });
  }, request);

  return fileName;
};

/**
 * Download a dashboard tile in any of its supported formats
 * @param {LookerSDK} sdk initialized Looker SDK
 * @param {IDashboardElement} tile Dashboard tile to render
 * @param {string} format format of rendering
 * @returns {Promise<undefined | string>} Name of file downloaded
 */
const downloadTile = async (
  sdk: LookerSDK,
  tile: IDashboardElement,
  format: string
) => {
  let fileName;
  if (!tile.query_id) {
    console.error(`Tile ${tile.title} does not have a query`);
    return;
  }
  try {
    if (isRenderable(format)) {
      fileName = await renderTile(sdk, tile, format);
    } else {
      // just try downloading the query results
      fileName = await downloadTileAs(sdk, tile, format);
    }
  } catch (err) {
    console.error(`'${format}' is probably not a valid format`);
    console.error(err);
  }
  return fileName;
};
(async () => {
  const { dashboardTitle, tileTitle, outputFormat } = getParams();
  if (!dashboardTitle || !tileTitle) {
    console.warn(
      'Please provide: <dashboardTitle> <tileTitle> [<ouputFormat>]'
    );
    console.warn(
      '  outputFormat defaults to "png". Many other formats are also supported. Refer to the run_query documentation for options.'
    );
    return;
  }
  const action = isRenderable(outputFormat) ? 'Rendering' : 'Downloading';
  console.log(
    `${action} dashboard "${dashboardTitle}" tile "${tileTitle}" as ${outputFormat} ...`
  );

  const dashboard = await getDashboard(sdk, dashboardTitle);
  if (dashboard) {
    const tile = getDashboardTile(dashboard, tileTitle);
    if (tile) {
      const fileName = await downloadTile(sdk, tile, outputFormat);
      console.log(`open "${fileName}" to see the download`);
    }
  }

  await sdk.authSession.logout(); // logout of API session
  if (!sdk.authSession.isAuthenticated()) {
    console.log('Logout successful');
  }
})();
