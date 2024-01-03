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

import path from 'path';
import type {
  IDashboard,
  IRenderTask,
  Looker40SDK as LookerSDK,
} from '@looker/sdk';

/**
 * Resolve a file name relative to the root of the repository
 * @param fileName to path to the root relative to the examples folder
 */
export const rootFile = (fileName: string) => {
  const result = path.join(__dirname, '/../..', fileName);
  return result;
};

/**
 * Path the ini file name to the root folder of the repository
 * @param fileName name of ini file. defaults to `looker.ini`
 */
export const rootIni = (fileName = 'looker.ini') => {
  return rootFile(fileName);
};

/**
 * Find a dashboard by title
 * @param sdk Looker SDK object
 * @param {string} title of dashboard
 * @returns {Promise<IDashboard>} the matched dashboard
 */
export const getDashboard = async (sdk: LookerSDK, title: string) => {
  const [dash] = await sdk.ok(sdk.search_dashboards({ title }));
  if (!dash) {
    console.warn(`No dashboard titled "${title}" was found`);
    const all = await sdk.ok(sdk.all_dashboards('id,title'));
    const titles = all.map(t => `${t.id}:${t.title}`);
    console.log(`Available dashboards are:\n${titles.join('\n')}\n`);
  }
  return dash;
};

/**
 * Get a tile by title from a dashboard
 * @param {IDashboard} dash Dashboard to search
 * @param {string} title Title title to find
 * @returns {IDashboardElement | undefined} Returns the found tile or undefined
 */
export const getDashboardTile = (dash: IDashboard, title: string) => {
  title = title.toLowerCase();
  if (!dash.dashboard_elements) return undefined;
  const [tile] = dash.dashboard_elements.filter(
    t => String(t.title).toLowerCase() === title
  );
  if (!tile) {
    console.warn(
      `No tile titled "${title}" found on Dashboard "${dash.title}"`
    );
    const tiles = dash.dashboard_elements
      .filter(t => typeof t.query_id === 'number')
      .map(t => t.title);
    console.log(`Available tiles with queries are:\n${tiles.join('\n')}\n`);
  }
  return tile;
};

/**
 * Wait specified milliseconds
 * @param {number} ms time in milliseconds
 * @returns {Promise<unknown>} promise timeout
 */
export const sleep = async (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

/**
 * Progress ticker callback type
 */
export type ProgressTicker = (
  elapsed: number,
  message: string | IRenderTask
) => void;

/**
 * Default render progress tick reporter
 * @param {number} elapsed Number of seconds elapsed for render task
 * @param {string | IRenderTask} message Message to output or render task poll (if failed)
 */
const defaultProgress = (elapsed: number, message: string | IRenderTask) => {
  if (typeof message === 'string') {
    if (elapsed >= 0) {
      console.log(`${elapsed} seconds elapsed ${message}`);
    } else {
      console.log(message);
    }
  } else {
    // expected to be a poll if we got here
    const poll = message as IRenderTask;
    if (poll.status === 'failure') {
      console.error('Render failed. Details:');
      console.error({ poll });
      const err = new Error();
      err.message = `${poll.status}: ${poll.status_detail} for ${poll.result_format} render by User ID ${poll.user_id}`;
      throw err;
    }
  }
};

/**
 * General-purpose "wait for render task to complete" function
 * @param {LookerSDK} sdk LookerSDK object
 * @param {string} taskId render task id
 * @param {ProgressTicker} progressTick callback for progress ticks
 * @param {number} pause number of seconds to wait before checking progress. Defaults to 0.5
 * @returns {Promise<string>} Results of render task. Can be a binary string
 */
export const waitForRender = async (
  sdk: LookerSDK,
  taskId: string,
  progressTick: ProgressTicker = defaultProgress,
  pause = 0.5
) => {
  // poll the render task until it completes
  let elapsed = 0.0;
  const delay = pause * 1000; // convert seconds to milliseconds
  while (true) {
    const poll = await sdk.ok(sdk.render_task(taskId));
    if (poll.status === 'failure') {
      progressTick(-1, poll);
      return;
    }
    if (poll.status === 'success') {
      break;
    }
    await sleep(delay);
    progressTick((elapsed += pause), '');
  }
  return await sdk.ok(sdk.render_task_results(taskId));
};
