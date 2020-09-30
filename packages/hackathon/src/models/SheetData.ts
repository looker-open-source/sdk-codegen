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
import { SheetSDK, ISheet } from '@looker/wholly-sheet'
import {
  Projects,
  Registrations,
  Technologies,
  ProjectTechnologies,
  Hackathons,
  TeamMembers,
  Judgings,
} from '.'

export class SheetData {
  projects: Projects
  technologies: Technologies
  registrations: Registrations
  projectTechnologies: ProjectTechnologies
  hackathons: Hackathons
  teamMembers: TeamMembers
  judgings: Judgings

  constructor(public readonly sheets: SheetSDK, sheet: ISheet) {
    this.projects = new Projects(sheets, sheet.tabs.projects)
    this.technologies = new Technologies(sheets, sheet.tabs.technologies)
    this.registrations = new Registrations(sheets, sheet.tabs.registrations)
    this.projectTechnologies = new ProjectTechnologies(
      sheets,
      sheet.tabs.project_technologies
    )
    this.hackathons = new Hackathons(sheets, sheet.tabs.hackathons)
    this.teamMembers = new TeamMembers(sheets, sheet.tabs.team_members)
    this.judgings = new Judgings(sheets, sheet.tabs.judgings)
  }
}
