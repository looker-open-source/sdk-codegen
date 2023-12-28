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
import {
  mockAdmin,
  mockJudge,
  mockProjects,
  mockStaff,
  mockUser,
  mockHackathons,
  mockUsers,
} from '../test-data';
import { Project } from './Projects';
import type { Hackathon } from './Hackathons';

const hackathons = mockHackathons();
const users = mockUsers();
const hackathon = hackathons.find('current') as Hackathon;
const projects = mockProjects(hackathons.rows, users.rows);

describe('Projects', () => {
  const proj1 = new Project({
    _id: 'p1',
    _user_id: mockUser.id,
    title: 'test project',
  });
  const proj2 = new Project({
    _id: 'p1',
    _user_id: 'different id',
    title: 'test project',
  });
  proj1.$hackathon = hackathon;
  proj2.$hackathon = hackathon;
  test('User can manage his own project', () => {
    expect(proj1.canUpdate(mockUser)).toEqual(true);
    expect(proj1.canDelete(mockUser)).toEqual(true);
    expect(proj1.canCreate(mockUser)).toEqual(true);
  });
  test("User cannot manage someone else's project", () => {
    expect(proj2.canUpdate(mockUser)).toEqual(false);
    expect(proj2.canDelete(mockUser)).toEqual(false);
    expect(proj2.canCreate(mockUser)).toEqual(false);
  });
  test("Staff update someone's project but not delete or create", () => {
    expect(proj2.canUpdate(mockStaff)).toEqual(true);
    expect(proj2.canDelete(mockStaff)).toEqual(false);
    expect(proj2.canCreate(mockStaff)).toEqual(false);
  });
  test("Judge can update someone's project but not delete or create", () => {
    expect(proj2.canUpdate(mockJudge)).toEqual(true);
    expect(proj2.canDelete(mockJudge)).toEqual(false);
    expect(proj2.canCreate(mockJudge)).toEqual(false);
  });
  test("Admin can do anything with someone's project", () => {
    expect(proj2.canUpdate(mockAdmin)).toEqual(true);
    expect(proj2.canDelete(mockAdmin)).toEqual(true);
    expect(proj2.canCreate(mockAdmin)).toEqual(true);
  });
  describe('filterBy', () => {
    test('user projects', () => {
      const actual = projects.filterBy(undefined, mockUser);
      expect(actual.length).toBeGreaterThan(0);
      actual.forEach((p: Project) => expect(p._user_id).toEqual(mockUser.id));
    });
    test('hackathon projects', () => {
      expect(hackathon).toBeDefined();
      if (hackathon) {
        const actual = projects.filterBy(hackathon);
        expect(actual.length).toBeGreaterThan(0);
        actual.forEach((p: Project) => {
          expect(p._hackathon_id).toEqual(hackathon._id);
        });
      }
    });
    test('hackathon + user projects', () => {
      expect(hackathon).toBeDefined();
      if (hackathon) {
        const actual = projects.filterBy(hackathon, mockUser);
        expect(actual.length).toBeGreaterThan(0);
        actual.forEach((p: Project) => {
          expect(p._user_id).toEqual(mockUser.id);
          expect(p._hackathon_id).toEqual(hackathon._id);
        });
      }
    });
  });
});
