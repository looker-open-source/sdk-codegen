/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { NodeSettingsIniFile, NodeSession, LookerSDK, IDashboard, IDashboardElement } from '@looker/sdk'
import * as fs from 'fs'

/**
 *
 * @type {string} Local configuration file name, one directory above
 */
const localConfig = '../looker.ini'

/**
 *
 * @type {NodeSettingsIniFile} Settings retrieved from the configuration file
 */
const settings = new NodeSettingsIniFile(localConfig, 'Looker')

/**
 * Automatic authentication support for the Node SDK
 * @type {NodeSession} Initialized node-based session manager
 */
const session = new NodeSession(settings)

/**
 * Initialized SDK object
 * @type {LookerSDK} SDK object configured for use with Node
 */
const sdk = new LookerSDK(session)

/**
 * Read command-line parameters. Still have a bug for png argument
 * @returns {{dashboardTitle: string; tileTitle: string; renderFormat: string}}
 */
const getParams = () => {
  const offset = 1
  const result = {
    dashboardTitle: process.argv.length >= offset + 1? process.argv[offset + 1] : '',
    tileTitle: process.argv.length > offset + 2 ? process.argv[offset + 2] : '',
    renderFormat: process.argv.length >= offset + 3 ? process.argv[offset + 3] : 'png'
  }
  return result
}

/**
 * Find a dashboard by title
 * @param {string} title of dashboard
 * @returns {Promise<IDashboard>} the matched dashboard
 */
const getDashboard = async (title: string) => {
  const [dash] = await sdk.ok(sdk.search_dashboards({title}))
  if (!dash) {
    console.warn(`No dashboard titled ${title} was found`)
  }
  return dash
}

/**
 * Get a tile by title from a dashboard
 * @param {IDashboard} dash Dashboard to search
 * @param {string} title Title title to find
 * @returns {IDashboardElement | undefined} Returns the found tile or undefined
 */
const getDashboardTile = (dash: IDashboard, title: string) => {
  title = title.toLowerCase()
  if (!dash.dashboard_elements) return undefined
  const [tile]= dash.dashboard_elements.filter(t => String(t.title).toLowerCase() === title)
  if (!tile) {
    console.warn(`No tile titled ${title} found on ${dash.title}`)
  }
  return tile
}

/**
 * Wait specified milliseconds
 * @param {number} ms time in milliseconds
 * @returns {Promise<unknown>} promise timeout
 */
const sleep = async (ms: number) => {
  return new Promise(resolve  =>{
    setTimeout(resolve, ms)
  })
}

/**
 * Download a dashboard tile when it's finished rendering
 * @param {LookerSDK} sdk initialized Looker SDK
 * @param {IDashboardElement} tile Dashboard tile to render
 * @param {string} format format of rendering
 * @returns {Promise<undefined | string>} Name of file downloaded
 */
const downloadTile = async (sdk: LookerSDK, tile: IDashboardElement, format: string) => {
  let fileName = undefined
  if (!tile.query_id) {
    console.error(`Tile ${tile.title} does not have a query`)
    return
  }
  try {
    const task = await sdk.ok(sdk.create_query_render_task(tile.query_id, format, 640, 480))

    if (!task || !task.id) {
      console.error(`Could not create a render task for ${tile.title}`)
      return
    }

    // poll the render task until it completes
    let elapsed = 0.0
    const delay = 500 // wait .5 seconds
    while (true) {
      const poll = await sdk.ok(sdk.render_task(task.id!))
      if (poll.status === 'failure') {
        console.log({poll})
        console.error(`Render failed for ${tile.title}`)
        return
      }
      if (poll.status === 'success') {
        break
      }
      await sleep(delay)
      console.log(`${elapsed += (delay/1000)} seconds elapsed`)
    }
    const result = await sdk.ok(sdk.render_task_results(task.id!))
    fileName = `${tile.title}.${format}`
    fs.writeFile(fileName, result, 'binary',(err) => {
        if (err) {
          fileName = undefined
          console.error(err)}
      }
    )

  } catch (err) {
    console.error(`'${format}' is probably not a valid format`)
    console.error(err)
  }
  return fileName
}

(async () => {
  const { dashboardTitle, tileTitle, renderFormat } = getParams()
  if (!dashboardTitle || !tileTitle) {
    console.warn('Please provide: <dashboardTitle> <titleTitle> [<renderFormat>]')
    console.warn('  renderFormat defaults to "png"')
    return
  }
  console.log(`Rendering dashboard "${dashboardTitle}" tile "${tileTitle}" as ${renderFormat} ...`)

  const dashboard = await getDashboard(dashboardTitle)
  if (dashboard) {
    const tile = getDashboardTile(dashboard, tileTitle)
    if (tile) {
      const fileName = await downloadTile(sdk, tile, renderFormat)
      console.log(`open ${fileName} to see the download`)
    }
  }

  await sdk.authSession.logout() // logout of API session
  if (!sdk.authSession.isAuthenticated()) {
    console.log('Logout successful')
  }

})()
