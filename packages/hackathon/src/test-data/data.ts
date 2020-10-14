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
import { ISheet, SheetSDK } from '@looker/wholly-sheet'
import { BrowserTransport, DefaultSettings } from '@looker/sdk-rtl'
import { ExtensionSDK } from '@looker/extension-sdk'
import { Looker40SDK } from '@looker/sdk'
import { SheetData } from '../models/SheetData'
import { GAuthSession } from '../authToken/gAuthSession'
import { Hackathon, Hackathons, Hacker, Projects } from '../models'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tabs = require('../../../wholly-sheet/src/tabs.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const creds = require('../../../../examples/access-token-server/service_account.json')

const sheet = { tabs } as ISheet
const settings = DefaultSettings()
const sheetSDK = new SheetSDK(
  new GAuthSession(
    {} as ExtensionSDK,
    settings,
    new BrowserTransport(settings)
  ),
  creds.sheet_id
)

export const sheetData = new SheetData(sheetSDK, sheet)
const mockSDK = {} as Looker40SDK

export const mockUser = new Hacker(mockSDK)
mockUser.user = { id: 1, first_name: 'Ordinary', last_name: 'Joe' }

export const mockStaff = new Hacker(mockSDK)
mockStaff.user = { id: 2, first_name: 'Looker', last_name: 'Staff' }
mockStaff.roles.add('staff')

export const mockJudge = new Hacker(mockSDK)
mockJudge.user = { id: 3, first_name: 'Looker', last_name: 'Judge' }
mockJudge.roles.add('judge')

export const mockAdmin = new Hacker(mockSDK)
mockJudge.user = { id: 4, first_name: 'Looker', last_name: 'Admin' }
mockAdmin.roles.add('admin')

// TODO make this a separate file and read it in
export const rawJson = `
{
  "projects": {
    "header": [
      "_id",
      "_updated",
      "_user_id",
      "_hackathon_id",
      "title",
      "description",
      "date_created",
      "project_type",
      "contestant",
      "locked",
      "more_info",
      "technologies"
    ],
    "rows": [
      {
        "_row": 2,
        "_id": "a",
        "_updated": "2020-10-13T18:02:24.511Z",
        "_user_id": "1",
        "_hackathon_id": "hack_at_home",
        "title": "cool project",
        "description": "a description of some project",
        "date_created": "2020-03-05T15:00:00+00:00",
        "project_type": "Invite Only",
        "contestant": "FALSE",
        "locked": "FALSE",
        "more_info": "",
        "technologies": "t1,t2,t3"
      },
      {
        "_row": 3,
        "_id": "b",
        "_updated": "2020-10-13T18:02:24.511Z",
        "_user_id": "2",
        "_hackathon_id": "hack_at_home",
        "title": "another project",
        "description": "the second project",
        "date_created": "2020-03-05T15:00:00.000000+00:00",
        "project_type": "Open",
        "contestant": "TRUE",
        "locked": "FALSE",
        "more_info": "",
        "technologies": "t1,t2,t3"
      },
      {
        "_row": 4,
        "_id": "c",
        "_updated": "2020-10-13T18:02:24.511Z",
        "_user_id": "3",
        "_hackathon_id": "JOIN_2019",
        "title": "HackWeek 2020",
        "description": "Just a third project",
        "date_created": "2020-03-05T15:00:00.000000+00:00",
        "project_type": "Closed",
        "contestant": "TRUE",
        "locked": "FALSE",
        "more_info": "",
        "technologies": "t4,t5"
      }
    ]
  },
  "hackathons":{
    "header": [
      "_id",
      "_updated",
      "name",
      "description",
      "location",
      "date",
      "duration_in_days",
      "max_team_size",
      "judging_starts",
      "judging_stops"
    ],
    "rows": [
      {
        "_row": 2,
        "_id": "JOIN_2019",
        "name": "JOIN in SFO",
        "description": "First hackathon!",
        "location": "sfo",
        "date": "2019-11-05T15:00:00.000000+00:00",
        "duration_in_days": "1",
        "max_team_size": "5",
        "judging_starts": "2019-11-05T18:00:00.000000+00:00",
        "judging_stops": "2019-11-05T19:00:00.000000+00:00"
      },
      {
        "_row": 3,
        "_id": "hack_at_home",
        "name": "Hack@Home",
        "description": "First global hackathon",
        "location": "worldwide",
        "date": "2020-11-09T15:00:00.000000+00:00",
        "duration_in_days": "1",
        "max_team_size": "5",
        "judging_starts": "2020-11-09T18:00:00.000000+00:00",
        "judging_stops": "2020-11-09T19:00:00.000000+00:00"
      }
    ]
  }
}`

export const data = JSON.parse(rawJson)
export const hackathonTab = data.hackathons
export const projectTab = data.projects
export const mockProjects = new Projects(sheetData, projectTab)
export const mockHackathons = new Hackathons(sheetData, hackathonTab)
export const mockHackathon = new Hackathon(hackathonTab.rows[1])
