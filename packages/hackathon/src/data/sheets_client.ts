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
import omit from 'lodash/omit';
import type { ValidationMessages } from '@looker/components';
import { getCore40SDK } from '@looker/extension-sdk-react';
import { SheetData, initActiveSheet } from '../models/SheetData';
import type {
  Hacker,
  IHackathonProps,
  IHackerProps,
  IJudgingProps,
  IProjectProps,
  IRegistrationProps,
  ITechnologyProps,
} from '../models';
import {
  Hackers,
  Judging,
  Project,
  Projects,
  Registration,
  sheetHeader,
} from '../models';
import type {
  HackersHeadings,
  JudgingsHeadings,
  ProjectsHeadings,
} from './types';

/**
 * Client to wholly sheets data.
 *
 * Wholly sheets deals with classes of data but has the ability to convert
 * the classes into and from javascript objects. The redux store only wants to
 * deal with json objects. The redux sagas use this class to get javascript
 * objects from wholly sheets classes and to update wholly sheets classes
 * with javascript object data.
 *
 * Important. DO NOT LEAK THE WHOLLY SHEETS CLASSES!!!!
 * Always convert to or from javascript objects.
 */
class SheetsClient {
  private sheetData?: SheetData;
  private hackers?: Hackers;
  private hacker?: IHackerProps;

  async getProjects(refresh = true): Promise<IProjectProps[]> {
    const projects = await this.getSheetProjects(refresh);
    return this.decorateProjectObjects(projects.toObject(), projects.rows);
  }

  async getProject(projectId: string): Promise<IProjectProps | undefined> {
    const projects = await this.getProjects(false);
    return projects.find(project => project._id === projectId);
  }

  async getCurrentProjects(hackathonId?: string): Promise<IProjectProps[]> {
    const data = await this.getSheetData();
    // Need to refresh teamMembers for latest team members
    await data.teamMembers.refresh();
    await data.projects.refresh();
    const hackathon = await this.getSheetHackathon(hackathonId);
    const rows = data.projects.filterBy(hackathon);
    // Create a projects object fom the filtered rows
    const result = new Projects(data, {
      header: data.projects.header,
      rows: [],
    });
    await result.refresh(rows);
    return this.decorateProjectObjects(result.toObject(), rows);
  }

  validateProject({
    title,
    description,
    project_type,
    technologies,
    more_info,
  }: IProjectProps): ValidationMessages | undefined {
    const validationMessages: ValidationMessages = {};
    if (!title || title.trim() === '') {
      validationMessages.title = {
        type: 'error',
        message: 'Title required',
      };
    }
    if (!description || description.trim() === '') {
      validationMessages.description = {
        type: 'error',
        message: 'Description required',
      };
    }
    if (!project_type || project_type.trim() === '') {
      validationMessages.project_type = {
        type: 'error',
        message: 'Project type required',
      };
    }
    if (!technologies || technologies.length === 0) {
      validationMessages.technologies = {
        type: 'error',
        message: 'At least one technology required',
      };
    }
    if (
      !(
        !more_info ||
        // Go figure this but its happening!
        more_info === '\0' ||
        more_info.trim() === '' ||
        more_info.startsWith('http://') ||
        more_info.startsWith('https://')
      )
    ) {
      validationMessages.more_info = {
        type: 'error',
        message: 'More info must be a URL',
      };
    }
    return Object.keys(validationMessages).length === 0
      ? undefined
      : validationMessages;
  }

  async createProject(
    hacker_id: string,
    projectProps: IProjectProps
  ): Promise<string> {
    const hackathon = await this.getSheetHackathon();
    projectProps._hackathon_id = hackathon!._id;
    projectProps.date_created = new Date();
    projectProps._user_id = hacker_id;
    const projects = await this.getSheetProjects();
    let project = new Project();
    project.fromObject(this.prepareProjectProperties(projectProps));
    project = await projects.save(project);
    return project._id;
  }

  async updateProject(projectProps: IProjectProps) {
    const data = await this.getSheetData();
    const projects = data.projects;
    const project = projects.find(projectProps._id, '_id');
    if (project) {
      this.updateJudges(project, projectProps.$judges);
      const projProps = this.prepareProjectProperties(projectProps);
      // TODO fromObject messes up $judging which is why judge updates are done first.
      project.fromObject(projProps);
      await projects.update(project);
      // TODO remove this when fromObject is fixed
      await this.getCurrentProjects();
    } else {
      throw new Error(`project not found for ${projectProps._id}`);
    }
  }

  async deleteProject(projectId: string) {
    const projects = await this.getSheetProjects();
    const project = projects.find(projectId, '_id');
    if (project) {
      await projects.delete(project);
    } else {
      throw new Error(`project not found for ${projectId}`);
    }
  }

  async lockProjects(
    lock: boolean,
    hackathonId?: string
  ): Promise<IProjectProps[]> {
    const projects = await this.getSheetProjects();
    const hackathon = await this.getSheetHackathon(hackathonId);
    if (hackathon) {
      await projects.lock(hackathon, lock);
      return await this.getCurrentProjects(hackathonId);
    } else {
      throw new Error(this.getHackathonErrorMessage(hackathonId));
    }
  }

  async lockProject(lock: boolean, projectId: string) {
    const data = await this.getSheetData();
    const projects = data.projects;
    const project = projects.find(projectId, '_id');
    if (project) {
      project.locked = lock;
      await projects.update(project);
    } else {
      throw new Error(`project not found for ${projectId}`);
    }
  }

  async getCurrentHackathon(): Promise<IHackathonProps> {
    const hackathon = await this.getSheetHackathon();
    if (hackathon) {
      return hackathon.toObject();
    } else {
      throw new Error(this.getHackathonErrorMessage());
    }
  }

  async getJudgings(hackathonId?: string): Promise<IJudgingProps[]> {
    const hackathon = await this.getSheetHackathon(hackathonId);
    if (hackathon) {
      const data = await this.getSheetData();
      await data.judgings.refresh();
      let judgings = data.judgings.filterBy(hackathon).map(j => j.toObject());
      const hacker = await this.getHacker();
      if (!hacker.canAdmin) {
        if (hacker.canJudge) {
          judgings = judgings.filter(j => j.user_id === hacker.id);
        } else {
          judgings = [];
        }
      }
      return judgings;
    } else {
      throw new Error(this.getHackathonErrorMessage(hackathonId));
    }
  }

  // Actualy updates judging. Saving a new judging happens in Project class.
  async saveJudging(judgingProps: IJudgingProps): Promise<IJudgingProps> {
    const data = await this.getSheetData();
    const judging = data.judgings.find(judgingProps._id, '_id');
    if (judging) {
      judging.fromObject(judgingProps);
      const updatedJudging = await data.judgings.update(judging);
      return updatedJudging.toObject();
    } else {
      throw new Error(`judging not found for ${judgingProps._id}`);
    }
  }

  async getHacker(): Promise<IHackerProps> {
    if (!this.hacker) {
      const sdk = getCore40SDK();
      const lookerUser = await sdk.ok(sdk.me());

      const data = await this.getSheetData();

      await this.loadHackers(data);

      const hacker: Hacker | undefined = this.hackers?.rows.find(
        h => h.user.id === lookerUser.id
      );

      if (!hacker) {
        throw new Error(
          'Failed to load hacker. Looker user id: ' + lookerUser.id
        );
      }

      // Assigns rights, perms, and attributes like timezone
      await hacker.getMe();

      this.hacker = this.decorateHacker(hacker.toObject(), hacker);
    }
    return this.hacker;
  }

  firstNameSort(a: IHackerProps, b: IHackerProps): number {
    if (a.firstName < b.firstName) {
      return -1;
    }
    if (a.firstName > b.firstName) {
      return 1;
    }
    return 0;
  }

  attendedSort(a: IHackerProps, b: IHackerProps): number {
    if (a.attended && !b.attended) {
      return -1;
    }
    if (!a.firstName && b.attended) {
      return 1;
    }
    return 0;
  }

  async getHackers(): Promise<{
    hackers: IHackerProps[];
    judges: IHackerProps[];
    admins: IHackerProps[];
    staff: IHackerProps[];
  }> {
    const hackers =
      this.hackers?.users?.map(hacker =>
        this.decorateHacker(hacker.toObject(), hacker)
      ) || [];
    const judges =
      this.hackers?.judges?.map(hacker =>
        this.decorateHacker(hacker.toObject(), hacker)
      ) || [];
    const admins =
      this.hackers?.admins?.map(hacker =>
        this.decorateHacker(hacker.toObject(), hacker)
      ) || [];
    const staff =
      this.hackers?.staff?.map(hacker =>
        this.decorateHacker(hacker.toObject(), hacker)
      ) || [];

    // Sort hackers by first name and attendance for
    // convenience when navigating list.
    hackers.sort(this.firstNameSort);
    hackers.sort(this.attendedSort);
    // Sort rest by first name for convenience
    judges.sort(this.firstNameSort);
    admins.sort(this.firstNameSort);
    staff.sort(this.firstNameSort);
    return { hackers, judges, admins, staff };
  }

  async registerUser(
    user: Hacker,
    hackathonId?: string
  ): Promise<IRegistrationProps> {
    const hackathon = await this.getSheetHackathon(hackathonId);
    if (!hackathon) {
      throw new Error(this.getHackathonErrorMessage(hackathonId));
    }

    const data = await this.getSheetData();

    let reg = data.registrations.rows.find(
      r => r._user_id === user.id && r.hackathon_id === hackathon._id
    );

    if (!reg) {
      reg = new Registration({
        _user_id: user.id,
        hackathon_id: hackathon._id,
      });
      reg = await data.registrations.save(reg);
    }

    user.registration = reg;
    return reg.toObject();
  }

  async getTechnologies(): Promise<ITechnologyProps[]> {
    const data = await this.getSheetData();
    if (!data.technologies || data.technologies.rows.length < 1) {
      await data.technologies.refresh();
    }
    return data.technologies.toObject();
  }

  async changeMembership(
    projectId: string,
    hackerId: string,
    leave: boolean
  ): Promise<IProjectProps> {
    const projects = await this.getSheetProjects();
    const project = projects.find(projectId, '_id');
    if (project) {
      const hacker = this.hackers!.rows.find(({ id }) => id === hackerId);
      if (hacker) {
        if (leave) {
          await project.leave(hacker);
        } else {
          await project.join(hacker);
        }
        return (await this.getProject(projectId)) as IProjectProps;
      } else {
        throw new Error(`hacker not found for ${hackerId}`);
      }
    } else {
      throw new Error(`project not found for ${projectId}`);
    }
  }

  getProjectsHeadings(): ProjectsHeadings {
    const headers = [
      'locked',
      'contestant',
      'title',
      'description',
      'project_type',
      '$techs',
      '$team_count',
      '$judge_count',
    ];
    const template = new Project();
    return sheetHeader(headers, template);
  }

  getHackersHeadings(): HackersHeadings {
    if (!this.hackers) {
      throw new Error('Cannot get hackers heading. All hackers not loaded');
    }
    if (!this.hacker) {
      throw new Error('Cannot get hackers heading. Hacker not loaded');
    }
    return sheetHeader(this.hackers.displayHeaders, this.hacker);
  }

  getJudgingsHeadings(): JudgingsHeadings {
    const headers = [
      '$judge_name',
      '$title',
      'execution',
      'scope',
      'novelty',
      'impact',
      'score',
      'notes',
    ];
    const template = new Judging();
    return sheetHeader(headers, template);
  }

  private async updateJudges(project: Project, judges: string[]) {
    const addedJudges = judges.filter(
      judge => !project.$judges.includes(judge)
    );
    const deletedJudges = project.$judges.filter(
      judge => !judges.includes(judge)
    );
    const hackerJudges = this.hackers?.judges;

    for (const judge of deletedJudges) {
      const hackerJudge = hackerJudges?.find(hj => hj.name === judge);
      if (hackerJudge) {
        await project.deleteJudge(hackerJudge);
      }
    }
    for (const judge of addedJudges) {
      const hackerJudge = hackerJudges?.find(hj => hj.name === judge);
      if (hackerJudge) {
        await project.addJudge(hackerJudge);
      }
    }
  }

  private prepareProjectProperties(projectProps: IProjectProps): IProjectProps {
    const props = omit(projectProps, [
      '$judges',
      '$judge_count',
      '$members',
      '$team_count',
    ]);
    return props as IProjectProps;
  }

  private async getSheetProjects(refresh = false) {
    const data = await this.getSheetData();
    if (refresh) {
      await data.projects.refresh();
    }
    return data.projects;
  }

  private async getSheetHackathon(hackathonId?: string) {
    if (hackathonId) {
      const hackathons = await this.getSheetHackathons();
      return await hackathons.find(hackathonId, '_id');
    } else {
      const data = this.getSheetData();
      return await (
        await data
      ).currentHackathon;
    }
  }

  private async getSheetHackathons() {
    const data = await this.getSheetData();
    return data.hackathons;
  }

  private getHackathonErrorMessage(hackathonId?: string) {
    return hackathonId
      ? `hackathon not found for ${hackathonId}`
      : 'current hackathon not found';
  }

  private async getSheetData(): Promise<SheetData> {
    if (this.sheetData) return this.sheetData;
    const sheetData = initActiveSheet(new SheetData());
    await sheetData.init();
    this.sheetData = sheetData;
    return this.sheetData;
  }

  private async loadHackers(data: SheetData) {
    if (!this.hackers) {
      const lookerSdk = getCore40SDK();
      const foo = new Hackers(lookerSdk);
      this.hackers = await foo.load(data);
    }
  }

  /**
   * Temporary method that adds missing data.
   * @param projectPropsList
   */
  private decorateProjectObjects(
    projectPropsList: IProjectProps[],
    projects: Project[]
  ): IProjectProps[] {
    return projectPropsList.map((projectProps, index) => {
      projects[index].load();
      if (!projectProps.$judges) {
        projectProps.$judges = projects[index].$judges;
      }
      if (!projectProps.$judge_count) {
        projectProps.$judge_count = projects[index].$judge_count;
      }
      if (!projectProps.$members) {
        projectProps.$members = projects[index].$members;
      }
      if (!projectProps.$team_count) {
        projectProps.$team_count = projectProps.$members.length;
      }
      projectProps.technologies = projectProps.technologies.filter(
        v => v !== ''
      );
      if (!projectProps.$techs) {
        projectProps.$techs = projects[index].$techs;
      }

      return projectProps;
    });
  }

  // Needs to match getter methods on Hacker class
  private decorateHacker(hackerProps: IHackerProps, _: Hacker): IHackerProps {
    if (hackerProps.id === undefined) {
      hackerProps.id = hackerProps.userRecord!._id;
    }
    if (hackerProps.firstName === undefined) {
      hackerProps.firstName = hackerProps.userRecord!.first_name;
    }
    if (hackerProps.firstName === undefined) {
      hackerProps.lastName = hackerProps.userRecord!.last_name;
    }
    if (hackerProps.name === undefined) {
      hackerProps.name = `${hackerProps.userRecord!.first_name} ${
        hackerProps.userRecord!.last_name
      }`;
    }
    if (hackerProps.registered === undefined && hackerProps.registration) {
      hackerProps.registered = hackerProps.registration.date_registered;
    }
    if (hackerProps.attended === undefined && hackerProps.registration) {
      hackerProps.attended = hackerProps.registration.attended;
    }
    return hackerProps;
  }
}

export const sheetsClient = new SheetsClient();
