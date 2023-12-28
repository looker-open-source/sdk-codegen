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
import { mockHackathons } from '../test-data';
import type { Hackathon } from './Hackathons';

const hackathons = mockHackathons();

describe('Hackathons', () => {
  test('gets current hackathon by default', () => {
    const actual = hackathons.currentHackathon;
    expect(actual).toBeDefined();
    expect(actual?._id).toEqual('current');
    expect(actual?.isActive()).toEqual(true);
  });
  test('past hackathon is not active', () => {
    const actual = hackathons.find('past') as Hackathon;
    expect(actual).toBeDefined();
    expect(actual._id).toEqual('past');
    expect(actual.isActive()).toEqual(false);
  });
  test('future hackathon is not active', () => {
    const actual = hackathons.find('future') as Hackathon;
    expect(actual).toBeDefined();
    expect(actual._id).toEqual('future');
    expect(actual.isActive()).toEqual(false);
  });
  test('setting default to true finds the earliest "current" hackathon', () => {
    const past = hackathons.find('past') as Hackathon;
    past.default = true;
    const actual = hackathons.getCurrentHackathon() as Hackathon;
    past.default = false;
    expect(actual).toBeDefined();
    expect(actual._id).toEqual('past');
  });
});
