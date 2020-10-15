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

import * as fs from 'fs'
import path from 'path'
import { Looker40SDK } from '@looker/sdk'
import { Hackathon, Hacker, Project, SheetData } from '../models'

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
const filePath = path.join(__dirname, './')
const localFile = (name: string) => path.join(filePath, name)

const json = fs.readFileSync(localFile('mockTabs.json'), { encoding: 'utf-8' })

export const mockTabs = JSON.parse(json)
export const mockHackathonTab = mockTabs.hackathons
export const mockProjectTab = mockTabs.projects

export const mockAHacker = (id: number): Hacker => {
  const result = new Hacker(mockSDK)
  result.user = { id: id, first_name: 'Ordinary', last_name: 'Joe' }
  return result
}

export const mockAJudge = (id: number): Hacker => {
  const result = mockAHacker(id)
  result.roles.add('judge')
  return result
}

export const mockAProject = (
  userId: number,
  hackathon: Hackathon,
  data?: SheetData
) => {
  return new Project(
    {
      _user_id: userId,
      _hackathon_id: hackathon._id,
      title: 'teamwork',
      description: 'join and leave',
      technologies: ['other'],
    },
    data
  )
}
