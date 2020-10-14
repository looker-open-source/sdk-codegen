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
import { DefaultSettings } from '@looker/sdk-rtl/lib/browser'
import { ITabTable, SheetSDK } from '@looker/wholly-sheet'
import { getExtensionSDK } from '@looker/extension-sdk'
import { getCore40SDK } from '@looker/extension-sdk-react'
import { SheetData } from '../models/SheetData'
import { GAuthSession } from '../authToken/gAuthSession'
import {
  Hacker,
  Hackathon,
  Project,
  Projects,
  Technologies,
  Registration,
  Hackers,
} from '../models'
import { ExtensionProxyTransport } from '../authToken/extensionProxyTransport'

let sheetData: SheetData

const initSheetData = async () => {
  if (sheetData) return sheetData
  // Values required
  const extSDK = getExtensionSDK()
  const tokenServerUrl =
    (await extSDK.userAttributeGetItem('token_server_url')) || ''
  const sheetId = (await extSDK.userAttributeGetItem('sheet_id')) || ''

  const options = {
    ...DefaultSettings(),
    ...{ base_url: tokenServerUrl },
  }

  const transport = new ExtensionProxyTransport(extSDK, options)
  const gSession = new GAuthSession(extSDK, options, transport)
  const sheetSDK = new SheetSDK(gSession, sheetId)
  const doc = await sheetSDK.index()
  sheetData = new SheetData(sheetSDK, doc)
  return sheetData
}

export const sheetsSdkHelper = {
  getProjects: async (): Promise<Projects> => {
    const data = await initSheetData()
    await data.projects.refresh()
    return data.projects
  },
  getCurrentProjects: async (hackathon: Hackathon): Promise<Projects> => {
    const data = await initSheetData()
    await data.projects.refresh()
    const rows = data.projects.filterBy(hackathon)
    // Create a projects object from the filtered rows
    const result = new Projects(data.sheetSDK, {
      header: data.projects.header,
      rows: rows,
    } as ITabTable)
    return result
  },
  createProject: async (
    hacker_id: string,
    projects: Projects,
    project: Project
  ) => {
    project._user_id = hacker_id
    project.date_created = new Date()
    await projects.save(project)
  },
  updateProject: async (projects: Projects, project: Project) => {
    await projects.update(project)
  },
  deleteProject: async (projects: Projects, project: Project) => {
    await projects.delete(project)
  },
  lockProjects: async (
    projects: Projects,
    hackathon: Hackathon,
    lock: boolean
  ): Promise<Projects> => {
    await projects.lock(hackathon, lock)
    return await sheetsSdkHelper.getCurrentProjects(hackathon)
  },
  getCurrentHackathon: async (): Promise<Hackathon> => {
    const data = await initSheetData()
    if (data.currentHackathon) {
      return data.currentHackathon!
    }
    await data.hackathons.refresh()
    return data.currentHackathon!
  },
  getHacker: async (): Promise<Hacker> => {
    const lookerSdk = getCore40SDK()
    const foo = new Hacker(lookerSdk)
    return await foo.getMe()
  },
  getHackers: async (): Promise<Hackers> => {
    const lookerSdk = getCore40SDK()
    const foo = new Hackers(lookerSdk)
    const data = await initSheetData()
    return await foo.load(data)
  },
  registerUser: async (
    hackathon: Hackathon,
    user: Hacker
  ): Promise<Registration> => {
    const data = await initSheetData()
    return await data.registerUser(hackathon, user)
  },
  getTechnologies: async (): Promise<Technologies> => {
    const data = await initSheetData()
    if (data.technologies && data.technologies.rows.length > 0)
      return data.technologies
    await data.technologies.refresh()
    return data.technologies
  },
}
