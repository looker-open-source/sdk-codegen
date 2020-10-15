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

import { ISheet, noDate, SheetSDK } from '@looker/wholly-sheet'
import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import { SheetData, Project, Hackathon } from '.'
import { mockAHacker, mockAJudge } from '../test-data/mocks'

let sheetSDK: SheetSDK
let doc: ISheet
let data: SheetData

const waitABit = 300000

const testProject = (hackathon: Hackathon) => {
  return new Project({
    _user_id: 1,
    _hackathon_id: hackathon._id,
    title: 'teamwork',
    description: 'join and leave',
    technologies: ['other'],
  })
}

describe('SheetData', () => {
  describe('end to end tests', () => {
    beforeAll(async () => {
      sheetSDK = await initSheetSDK()
      doc = await sheetSDK.index()
      data = new SheetData(sheetSDK, doc)
    })
    test('loads', async () => {
      const actual = data
      expect(actual.hackathons.rows.length).toBeGreaterThan(0)
      expect(actual.users.rows.length).toBeGreaterThan(0)
      expect(actual.judgings.rows.length).toBeGreaterThan(0)
      expect(actual.projects.rows.length).toBeGreaterThan(0)
      expect(actual.projectTechnologies.rows.length).toBeGreaterThan(0)
      expect(actual.registrations.rows.length).toBeGreaterThan(0)
      expect(actual.teamMembers.rows.length).toBeGreaterThan(0)
      expect(actual.technologies.rows.length).toBeGreaterThan(0)
      expect(actual.hackathons.checkHeader()).toEqual(true)
      expect(actual.users.checkHeader()).toEqual(true)
      expect(actual.judgings.checkHeader()).toEqual(true)
      expect(actual.projects.checkHeader()).toEqual(true)
      expect(actual.projectTechnologies.checkHeader()).toEqual(true)
      expect(actual.registrations.checkHeader()).toEqual(true)
      expect(actual.teamMembers.checkHeader()).toEqual(true)
      expect(actual.technologies.checkHeader()).toEqual(true)
    })
    test('gets current hackathon', () => {
      const actual = data.currentHackathon
      expect(actual).toBeDefined()
      expect(actual?.judging_stops.getTime()).toBeGreaterThan(
        new Date().getTime()
      )
    })
    test('registers a user', async () => {
      const hackathon = data.currentHackathon
      expect(hackathon).toBeDefined()
      if (hackathon) {
        const mockUser = mockAHacker(1)
        const actual = await data.registerUser(hackathon, mockUser)
        expect(actual._user_id).toEqual(mockUser.id)
        expect(actual.hackathon_id).toEqual(hackathon._id)
        expect(actual._updated).not.toEqual(noDate)
        expect(actual.date_registered).not.toEqual(noDate)
        expect(actual.attended).toEqual(true)
      }
    })
    test(
      'locks hackathon projects',
      async () => {
        const hackathon = data.currentHackathon
        const projects = data.projects
        expect(hackathon).toBeDefined()
        if (hackathon) {
          const locked = await projects.lock(hackathon, true)
          expect(locked).toBeDefined()
          expect(locked.length).toBeGreaterThan(0)
          locked.forEach((p) => {
            expect(p.locked).toEqual(true)
            expect(p._hackathon_id).toEqual(hackathon._id)
          })
          const unlocked = await projects.lock(hackathon, false)
          expect(unlocked).toBeDefined()
          expect(unlocked.length).toBeGreaterThan(0)
          unlocked.forEach((p) => {
            expect(p.locked).toEqual(false)
            expect(p._hackathon_id).toEqual(hackathon._id)
          })
        }
      },
      waitABit
    )
    describe('TeamMembers', () => {
      test(
        'can join',
        async () => {
          const hackathon = data.currentHackathon
          if (hackathon) {
            const projects = data.projects
            expect(projects).toBeDefined()
            expect(projects.rows).toBeDefined()
            let project = await data.projects.save(testProject(hackathon))
            expect(project.$team.length).toEqual(0)
            for (let i = 0; i <= hackathon.max_team_size; i++) {
              const hacker = mockAHacker(i)
              if (i < hackathon.max_team_size) {
                project = await projects.join(project, hacker)
                expect(project.$team.length).toEqual(i + 1)
              } else {
                try {
                  project = await projects.join(project, hacker)
                  expect('we').toEqual('should not be here')
                } catch (e) {
                  expect(e.message).toMatch(/team members per project/)
                }
              }
            }
            const cleanup = await projects.delete(project)
            expect(cleanup).toEqual(true)
            expect(
              data.teamMembers.find(project._id, 'project_id')
            ).toBeUndefined()
          }
        },
        waitABit
      )
      test(
        'can leave',
        async () => {
          const hackathon = data.currentHackathon
          if (hackathon) {
            const projects = data.projects
            expect(projects).toBeDefined()
            expect(projects.rows).toBeDefined()
            let project = await data.projects.save(testProject(hackathon))
            expect(project.$team.length).toEqual(0)
            for (let i = 0; i < hackathon.max_team_size; i++) {
              const hacker = mockAHacker(i)
              project = await projects.join(project, hacker)
            }
            expect(project.$team.length).toEqual(hackathon.max_team_size)

            for (let i = hackathon.max_team_size - 1; i >= 0; i--) {
              const hacker = mockAHacker(i)
              const member = project.findMember(hacker)
              expect(member).toBeDefined()
              expect(member?.user_id).toEqual(hacker.id)
              project = await projects.leave(project, hacker)
              expect(
                project.$team.find((t) => t.user_id === hacker.id)
              ).toBeUndefined()
              expect(project.$team.length).toEqual(i)
            }
            const cleanup = await projects.delete(project)
            expect(cleanup).toEqual(true)
            expect(
              data.teamMembers.find(project._id, 'project_id')
            ).toBeUndefined()
          }
        },
        waitABit
      )
    })
    describe('Judgings', () => {
      test(
        'add a judge only once',
        async () => {
          const hackathon = data.currentHackathon
          if (hackathon) {
            const projects = data.projects
            expect(projects).toBeDefined()
            expect(projects.rows).toBeDefined()
            let project = await data.projects.save(testProject(hackathon))
            expect(project.$judgings.length).toEqual(0)
            const judge = mockAJudge(1)
            project = await projects.addJudge(project, judge)
            expect(project.$judgings.length).toEqual(1)
            project = await projects.addJudge(project, judge)
            expect(project.$judgings.length).toEqual(1)
            const cleanup = await projects.delete(project)
            expect(cleanup).toEqual(true)
            expect(
              data.judgings.find(project._id, 'project_id')
            ).toBeUndefined()
          }
        },
        waitABit
      )
      test(
        'delete a judge only once',
        async () => {
          const hackathon = data.currentHackathon
          if (hackathon) {
            const projects = data.projects
            expect(projects).toBeDefined()
            expect(projects.rows).toBeDefined()
            let project = await data.projects.save(testProject(hackathon))
            expect(project.$judgings.length).toEqual(0)
            const judge = mockAJudge(1)
            project = await projects.addJudge(project, judge)
            expect(project.$judgings.length).toEqual(1)
            project = await projects.deleteJudge(project, mockAJudge(2))
            expect(project.$judgings.length).toEqual(1)
            project = await projects.deleteJudge(project, judge)
            expect(project.$judgings.length).toEqual(0)
            const cleanup = await projects.delete(project)
            expect(cleanup).toEqual(true)
            expect(
              data.judgings.find(project._id, 'project_id')
            ).toBeUndefined()
          }
        },
        waitABit
      )
      test('invalid judge rejected', async () => {
        const projects = data.projects
        expect(projects).toBeDefined()
        expect(projects.rows).toBeDefined()
        expect(projects.rows.length).toBeGreaterThan(0)
        const hacker = mockAHacker(1)
        const project = projects.rows[0]
        try {
          await projects.addJudge(project, hacker)
          expect('we').toEqual('should not be here')
        } catch (e) {
          expect(e.message).toMatch(/is not a judge/)
        }
      })
    })
  })
})
