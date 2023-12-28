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

import type { IRowModelProps, ITabTable } from '@looker/wholly-artifact';
import { compareDates, noDate, WhollyArtifact } from '@looker/wholly-artifact';
import { getCore40SDK } from '@looker/extension-sdk-react';

import type { ISheetRow } from './SheetRow';
import { SheetRow } from './SheetRow';
import type { SheetData } from './SheetData';

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export interface IHackathonProps extends IRowModelProps {
  name: string;
  description: string;
  location: string;
  date: Date;
  duration_in_days: number;
  max_team_size: number;
  judging_starts: Date;
  judging_stops: Date;
  default: boolean;
}

export interface IHackathon extends IHackathonProps, ISheetRow {
  isActive(): boolean;
}

/** IMPORTANT: properties must be declared in the tab sheet's columnar order, not sorted order */
export class Hackathon extends SheetRow<IHackathon> {
  name = '';
  description = '';
  location = '';
  date: Date = noDate;
  duration_in_days = 0;
  max_team_size = 0;
  judging_starts: Date = noDate;
  judging_stops: Date = noDate;
  default = false;
  constructor(values?: any) {
    super();
    // IMPORTANT: this must be done after super() constructor is called so keys are established
    // there may be a way to overload the constructor so this isn't necessary but pattern hasn't been found
    this.assign(values);
  }

  tableName() {
    return 'Hackathon';
  }

  isActive() {
    const now = new Date().getTime();
    return this.date.getTime() <= now && this.judging_stops.getTime() >= now;
  }

  toObject(): IHackathonProps {
    return super.toObject() as IHackathonProps;
  }
}

export class Hackathons extends WhollyArtifact<Hackathon, IHackathonProps> {
  private _hackathon: Hackathon | undefined;

  constructor(
    public readonly data: SheetData,
    public readonly table: ITabTable
  ) {
    super(getCore40SDK(), table);
  }

  typeRow<Hackathon>(values?: any) {
    return new Hackathon(values) as unknown as Hackathon;
  }

  getCurrentHackathon(): Hackathon | undefined {
    if (!this.rows || this.rows.length === 0) return undefined;
    // Sort hackathons in chronological order by start time ... maybe we sort by the stop of judging instead?
    const sorted = this.rows.sort((a, b) => compareDates(a.date, b.date));
    let current = sorted.find((h) => h.default);
    if (current) {
      this._hackathon = current as Hackathon;
      return this._hackathon;
    }
    const now = new Date().getTime();
    current = sorted.find((hack) => hack.judging_stops.getTime() >= now);
    if (!current) {
      // Finally, default to the last hackathon
      current = sorted[sorted.length - 1];
    }
    this._hackathon = current as Hackathon;
    return this._hackathon;
  }

  /** finds the "next up" or active hackathon and caches it for the instance lifetime */
  get currentHackathon(): Hackathon | undefined {
    if (this._hackathon) return this._hackathon;
    return this.getCurrentHackathon();
  }
}
