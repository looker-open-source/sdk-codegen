import { Project } from './Projects'
import {
  mockAdmin,
  mockHackathon,
  mockJudge,
  mockProjects,
  mockStaff,
  mockUser,
} from '../test-data/data'

describe('Projects', () => {
  const proj1 = new Project({
    _id: 'p1',
    _user_id: mockUser.id,
    title: 'test project',
  })
  const proj2 = new Project({
    _id: 'p1',
    _user_id: 'different id',
    title: 'test project',
  })
  test('User can manage his own project', () => {
    expect(proj1.canUpdate(mockUser)).toEqual(true)
    expect(proj1.canDelete(mockUser)).toEqual(true)
    expect(proj1.canCreate(mockUser)).toEqual(true)
  })
  test("User cannot manage someone else's project", () => {
    expect(proj2.canUpdate(mockUser)).toEqual(false)
    expect(proj2.canDelete(mockUser)).toEqual(false)
    expect(proj2.canCreate(mockUser)).toEqual(false)
  })
  test("Staff update someone's project but not delete or create", () => {
    expect(proj2.canUpdate(mockStaff)).toEqual(true)
    expect(proj2.canDelete(mockStaff)).toEqual(false)
    expect(proj2.canCreate(mockStaff)).toEqual(false)
  })
  test("Judge can update someone's project but not delete or create", () => {
    expect(proj2.canUpdate(mockJudge)).toEqual(true)
    expect(proj2.canDelete(mockJudge)).toEqual(false)
    expect(proj2.canCreate(mockJudge)).toEqual(false)
  })
  test("Admin can do anything with someone's project", () => {
    expect(proj2.canUpdate(mockAdmin)).toEqual(true)
    expect(proj2.canDelete(mockAdmin)).toEqual(true)
    expect(proj2.canCreate(mockAdmin)).toEqual(true)
  })
  describe('filterBy', () => {
    test('user projects', () => {
      const actual = mockProjects.filterBy(undefined, mockUser)
      expect(actual.length).toBeGreaterThan(0)
      actual.forEach((p) => expect(p._user_id).toEqual(mockUser.id))
    })
    test('hackathon projects', () => {
      const hackathon = mockHackathon
      expect(hackathon).toBeDefined()
      if (hackathon) {
        const actual = mockProjects.filterBy(hackathon)
        expect(actual.length).toBeGreaterThan(0)
        actual.forEach((p) => {
          expect(p._hackathon_id).toEqual(hackathon._id)
        })
      }
    })
    test('hackathon + user projects', () => {
      const hackathon = mockHackathon
      expect(hackathon).toBeDefined()
      if (hackathon) {
        const actual = mockProjects.filterBy(hackathon, mockUser)
        expect(actual.length).toBeGreaterThan(0)
        actual.forEach((p) => {
          expect(p._user_id).toEqual(mockUser.id)
          expect(p._hackathon_id).toEqual(hackathon._id)
        })
      }
    })
  })
})
