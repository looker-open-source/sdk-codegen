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

// import type { ISheet, SheetSDK } from '@looker/wholly-sheet'
import { add } from 'date-fns';
// import { initSheetSDK } from '../../../wholly-sheet/src/testUtils/testUtils'
import {
  mockAHacker,
  mockAJudge,
  mockAProject,
  wait2Mins,
} from '../test-data/mocks';
// import { initActiveSheet } from './SheetData'
import type { SheetData, ITeamMemberProps } from '.';

// let sheetSDK: SheetSDK
// let doc: ISheet
let data: SheetData;

// Multiple comments to pass lint. Skipped all tests.
// TODO: With WhollyArtifact change,
// need to setup `data` differently for tests.
describe.skip('SheetData', () => {
  describe('end to end tests', () => {
    beforeAll(async () => {
      // sheetSDK = await initSheetSDK()
      // doc = await sheetSDK.index()
      // data = initActiveSheet(sheetSDK, doc)
    });
    test('loads', async () => {
      const actual = data;
      expect(actual.hackathons.rows.length).toBeGreaterThan(0);
      expect(actual.users.rows.length).toBeGreaterThan(0);
      expect(actual.judgings.rows.length).toBeGreaterThan(0);
      expect(actual.projects.rows.length).toBeGreaterThan(0);
      expect(actual.registrations.rows.length).toBeGreaterThan(0);
      expect(actual.teamMembers.rows.length).toBeGreaterThan(0);
      expect(actual.technologies.rows.length).toBeGreaterThan(0);
      expect(actual.hackathons.checkHeader()).toEqual(true);
      expect(actual.users.checkHeader()).toEqual(true);
      expect(actual.judgings.checkHeader()).toEqual(true);
      expect(actual.projects.checkHeader()).toEqual(true);
      expect(actual.registrations.checkHeader()).toEqual(true);
      expect(actual.teamMembers.checkHeader()).toEqual(true);
      expect(actual.technologies.checkHeader()).toEqual(true);
    });
    describe('current hackathon detection', () => {
      test('always gets a hackathon', () => {
        data.hackathons.rows.forEach((h) => (h.default = false));
        const actual = data.hackathons.getCurrentHackathon();
        expect(actual).toBeDefined();
      });
      test('gets next hackathon as current', () => {
        data.hackathons.rows.forEach((h) => (h.default = false));
        data.hackathons.rows[data.hackathons.rows.length - 1].judging_stops =
          add(new Date(), { hours: 8 });
        const actual = data.hackathons.getCurrentHackathon();
        expect(actual).toBeDefined();
        expect(actual?.judging_stops.getTime()).toBeGreaterThan(
          new Date().getTime()
        );
      });
    });
    test(
      'locks hackathon projects',
      async () => {
        const hackathon = data.currentHackathon;
        const projects = data.projects;
        expect(hackathon).toBeDefined();
        if (hackathon) {
          const locked = await projects.lock(hackathon, true);
          expect(locked).toBeDefined();
          expect(locked.length).toBeGreaterThan(0);
          locked.forEach((p) => {
            expect(p.locked).toEqual(true);
            expect(p._hackathon_id).toEqual(hackathon._id);
          });
          const unlocked = await projects.lock(hackathon, false);
          expect(unlocked).toBeDefined();
          expect(unlocked.length).toBeGreaterThan(0);
          unlocked.forEach((p) => {
            expect(p.locked).toEqual(false);
            expect(p._hackathon_id).toEqual(hackathon._id);
          });
        }
      },
      wait2Mins
    );
    describe('TeamMembers', () => {
      test(
        'can join',
        async () => {
          const hackathon = data.currentHackathon;
          if (hackathon) {
            const projects = data.projects;
            expect(projects).toBeDefined();
            expect(projects.rows).toBeDefined();
            let project = await data.projects.save(
              mockAProject('1', hackathon._id)
            );
            expect(project.$team.length).toEqual(0);
            for (let i = 0; i <= hackathon.max_team_size; i++) {
              const hacker = mockAHacker(i.toString());
              if (i < hackathon.max_team_size) {
                project = await project.join(hacker);
                expect(project.$team.length).toEqual(i + 1);
                expect(project.$team_count).toEqual(
                  `${project.$team.length}/${hackathon.max_team_size}`
                );
              } else {
                try {
                  project = await project.join(hacker);
                  expect('we').toEqual('should not be here');
                } catch (e: any) {
                  expect(e.message).toMatch(/team members per project/);
                }
              }
            }
            const cleanup = await projects.delete(project);
            expect(cleanup).toEqual(true);
            expect(
              data.teamMembers.find(project._id, 'project_id')
            ).toBeUndefined();
          }
        },
        wait2Mins
      );
      test(
        'can leave',
        async () => {
          const hackathon = data.currentHackathon;
          if (hackathon) {
            const projects = data.projects;
            expect(projects).toBeDefined();
            expect(projects.rows).toBeDefined();
            let project = await data.projects.save(mockAProject(1, hackathon));
            expect(project.$team.length).toEqual(0);
            for (let i = 0; i < hackathon.max_team_size; i++) {
              const hacker = mockAHacker(i.toString());
              project = await project.join(hacker);
            }
            expect(project.$team.length).toEqual(hackathon.max_team_size);

            for (let i = hackathon.max_team_size - 1; i >= 0; i--) {
              const hacker = mockAHacker(i.toString());
              const member = project.findMember(hacker);
              expect(member).toBeDefined();
              expect(member?.user_id).toEqual(hacker.id);
              project = await project.leave(hacker);
              expect(
                project.$team.find(
                  (t: ITeamMemberProps) => t.user_id === hacker.id
                )
              ).toBeUndefined();
              expect(project.$team.length).toEqual(i);
            }
            const cleanup = await projects.delete(project);
            expect(cleanup).toEqual(true);
            expect(
              data.teamMembers.find(project._id, 'project_id')
            ).toBeUndefined();
          }
        },
        wait2Mins
      );
    });
    describe('Judgings', () => {
      test(
        'add a judge only once',
        async () => {
          const hackathon = data.currentHackathon;
          if (hackathon) {
            const projects = data.projects;
            expect(projects).toBeDefined();
            expect(projects.rows).toBeDefined();
            let project = await data.projects.save(mockAProject(1, hackathon));
            expect(project.$judgings.length).toEqual(0);
            expect(project.$judge_count).toEqual(0);
            const judge = mockAJudge('1');
            project = await project.addJudge(judge);
            expect(project.$judgings.length).toEqual(1);
            const judging = project.$judgings[0];
            expect(judging.project_id).toEqual(project._id);
            expect(judging.$judge_name).toEqual(judge.name);
            project = await project.addJudge(judge);
            expect(project.$judgings.length).toEqual(1);
            expect(project.$judge_count).toEqual(1);
            const cleanup = await projects.delete(project);
            expect(cleanup).toEqual(true);
            expect(
              data.judgings.find(project._id, 'project_id')
            ).toBeUndefined();
          }
        },
        wait2Mins
      );
      test(
        'delete a judge only once',
        async () => {
          const hackathon = data.currentHackathon;
          if (hackathon) {
            const projects = data.projects;
            expect(projects).toBeDefined();
            expect(projects.rows).toBeDefined();
            let project = await data.projects.save(mockAProject(1, hackathon));
            expect(project.$judgings.length).toEqual(0);
            const judge = mockAJudge('1');
            project = await project.addJudge(judge);
            expect(project.$judgings.length).toEqual(1);
            project = await project.deleteJudge(mockAJudge('2'));
            expect(project.$judgings.length).toEqual(1);
            project = await project.deleteJudge(judge);
            expect(project.$judgings.length).toEqual(0);
            const cleanup = await projects.delete(project);
            expect(cleanup).toEqual(true);
            expect(
              data.judgings.find(project._id, 'project_id')
            ).toBeUndefined();
          }
        },
        wait2Mins
      );
      test('invalid judge rejected', async () => {
        const projects = data.projects;
        expect(projects).toBeDefined();
        expect(projects.rows).toBeDefined();
        expect(projects.rows.length).toBeGreaterThan(0);
        const hacker = mockAHacker('1');
        const project = projects.rows[0];
        try {
          await project.addJudge(hacker);
          expect('we').toEqual('should not be here');
        } catch (e: any) {
          expect(e.message).toMatch(/is not a judge/);
        }
      });
    });
  });
});
