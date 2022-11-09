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

import type { Looker40SDK } from '@looker/sdk'
import type { ISheet, ITabTable, SheetSDK } from '@looker/wholly-sheet'
import { addMinutes } from '@looker/wholly-sheet'
import { SheetData } from '../models'
import {
  Hackathon,
  Hackathons,
  Hacker,
  Judging,
  Project,
  Projects,
  User,
  Users,
} from '../models'
import { initActiveSheet } from '../models/SheetData'

export const wait2Mins = 2 * 60 * 1000

export const mockLookerSDK = {} as Looker40SDK
export const mockSheet = {} as ISheet
export const mockSheetSDK = {} as SheetSDK
export const noSheetData = {} as SheetData
export const mockTabTable = {} as ITabTable

export const mockUser = new Hacker(mockLookerSDK)
mockUser.user = { id: '1', first_name: 'Ordinary', last_name: 'Joe' }
mockUser.assignRights()

export const mockStaff = new Hacker(mockLookerSDK)
mockStaff.user = { id: '2', first_name: 'Looker', last_name: 'Staff' }
mockStaff.roles.add('staff')
mockStaff.assignRights()

export const mockJudge = new Hacker(mockLookerSDK)
mockJudge.user = { id: '3', first_name: 'Looker', last_name: 'Judge' }
mockJudge.roles.add('judge')
mockJudge.assignRights()

export const mockAdmin = new Hacker(mockLookerSDK)
mockJudge.user = { id: '4', first_name: 'Looker', last_name: 'Admin' }
mockAdmin.roles.add('admin')
mockAdmin.assignRights()

// const filePath = path.join(__dirname, './')
// const localFile = (name: string) => path.join(filePath, name)
//
// const json = fs.readFileSync(localFile('mockTabs.json'), { encoding: 'utf-8' })
//
// export const mockTabs = JSON.parse(json)
// export const mockHackathonData = mockTabs.hackathons
// export const mockProjectData = mockTabs.projects

export const mockAHacker = (id: string): Hacker => {
  const result = new Hacker(mockLookerSDK)
  result.user = { id: id, first_name: 'Ordinary', last_name: 'Joe' }
  result.assignRights()
  return result
}

export const mockAJudge = (id: string): Hacker => {
  const result = mockAHacker(id)
  result.roles.add('judge')
  result.assignRights()
  return result
}

export const mockFullProject = (
  userId: string | number,
  hackathon: Hackathon | string,
  title = 'mocked title',
  description = 'mocked description',
  technologies = ['other']
) => {
  return new Project({
    _user_id: userId.toString(),
    _hackathon_id: hackathon instanceof Hackathon ? hackathon._id : hackathon,
    title,
    description,
    technologies,
  })
}

export const mockAProject = (
  userId: string | number,
  hackathon: Hackathon | string
) => {
  const hackathonId = hackathon instanceof Hackathon ? hackathon._id : hackathon
  const desc = `Hackathon ${hackathonId} project for user ${userId}`
  return mockFullProject(userId, hackathonId, desc, desc, ['other'])
}

/**
 * Mock up a hackathon instance
 * @param id to use as hackathon id and description
 * @param startDate of the hackathon
 * @param maxTeam defaults to 5 for the maximum team size
 * @param judgingStarts Defaults to 480 minutes before judging starts.
 * @param judgingPeriod Defaults to 120 minutes of judging time.
 */
export const mockAHackathon = (
  id: string,
  startDate: Date,
  maxTeam = 5,
  judgingStarts = 8 * 60,
  judgingPeriod = 2 * 60
) => {
  const judging_starts = addMinutes(startDate, judgingStarts)
  const judging_stops = addMinutes(judging_starts, judgingPeriod)
  const result = new Hackathon({
    _id: id,
    name: id,
    description: id,
    date: startDate,
    max_team_size: maxTeam,
    judging_starts,
    judging_stops,
  })
  return result
}

export const mockHackathons = () => {
  const gap = 90 * 24 * 60
  const current = new Date()
  const past = addMinutes(current, -gap)
  const future = addMinutes(current, gap)
  const rows = [
    mockAHackathon('past', past),
    mockAHackathon('current', current),
    mockAHackathon('future', future),
  ]
  const header = rows[0].header()
  const result = new Hackathons(noSheetData, { header, rows })
  return result
}

export const mockProjects = (hackathons: Hackathon[], users: User[]) => {
  const rows: Project[] = []
  hackathons.forEach((h) => {
    users.forEach((u) => {
      rows.push(
        mockFullProject(u._id, h._id, `${h._id} project for user ${u._id}`)
      )
    })
  })
  const header = rows[0].header()
  const result = new Projects(noSheetData, { header, rows })
  return result
}

export const mockJudging = (userId: string): Judging =>
  new Judging({
    user_id: userId,
    project_id: 'X',
    execution: 1,
    ambition: 1,
    coolness: 1,
    impact: 1,
    score: 1,
    notes: 'adjudicatory',
  })

export const mockUsers = () => {
  const rows = [
    new User({ ...mockUser, ...{ _id: mockUser.id } }),
    new User({ ...mockStaff, ...{ _id: mockStaff.id } }),
    new User({ ...mockJudge, ...{ _id: mockJudge.id } }),
    new User({ ...mockAdmin, ...{ _id: mockAdmin.id } }),
  ]
  const header = rows[0].header()
  const result = new Users(noSheetData, { header, rows })
  return result
}

export const mockSheetData = () => {
  const result = initActiveSheet(new SheetData())
  result.users = mockUsers()
  result.hackathons = mockHackathons()
  result.projects = mockProjects(result.hackathons.rows, result.users.rows)
  return result
}
