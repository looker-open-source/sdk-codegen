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
import type { IRowModel } from './RowModel';
import { RowAction, RowModel, nilCell, noDate, stringer } from './RowModel';

export interface ITestRowProps {
  name: string;
  toggle: boolean;
  score: number;
  average: number;
  strArray: string[];
  $notheader: string;
}

export interface ITestRow extends IRowModel, ITestRowProps {}

export class TestRow extends RowModel<ITestRow> {
  name = '';
  toggle = false;
  score = 0;
  average = 0.0;
  strArray = [];
  $notheader = '';
  constructor(values?: any) {
    super(values);
    if (values) this.assign(values);
  }
}

export const testRowNow = new Date();
export const testRowValues = [
  '3',
  testRowNow,
  'Looker',
  true,
  5,
  3.2,
  ['a', 'b'],
];

export const testRowObject = {
  _row: 2,
  _id: testRowValues[0],
  _updated: testRowValues[1],
  name: testRowValues[2],
  toggle: testRowValues[3],
  score: testRowValues[4],
  average: testRowValues[5],
  strArray: testRowValues[6],
};

describe('RowModel', () => {
  describe('stringer', () => {
    test('formats dates', () => {
      expect(stringer(new Date('2019-11-05T15:00:00.000000+00:00'))).toEqual(
        '2019-11-05T15:00:00.000Z'
      );
    });
    test('NILs empty dates', () => {
      expect(stringer(noDate)).toEqual(nilCell);
    });
    test('NILs undefined', () => {
      expect(stringer(undefined)).toEqual(nilCell);
    });
    test('NILs null', () => {
      expect(stringer(null)).toEqual(nilCell);
    });
    test('Returns empty string', () => {
      expect(stringer('')).toEqual('');
    });
    test('Returns bool string', () => {
      expect(stringer(true)).toEqual('true');
      expect(stringer(false)).toEqual('false');
    });
    test('Returns float string', () => {
      expect(stringer(1.2)).toEqual('1.2');
    });
    test('Returns int string', () => {
      expect(stringer(12)).toEqual('12');
    });
    test('Returns comma-delimited array', () => {
      expect(stringer(['a', 'b'])).toEqual('a,b');
    });
  });

  test('header omits row key and $ vars', () => {
    const row = new TestRow();
    const expected = [
      '_id',
      '_updated',
      'name',
      'toggle',
      'score',
      'average',
      'strArray',
    ];
    const actual = row.header();
    expect(actual).toEqual(expected);
  });

  test('displayHeaders omits _ and $ vars', () => {
    const row = new TestRow();
    const expected = ['name', 'toggle', 'score', 'average', 'strArray'];
    const actual = row.displayHeader();
    expect(actual).toEqual(expected);
  });

  describe('initialization', () => {
    test('inits with default values', () => {
      const actual = new TestRow();
      expect(actual._row).toEqual(0);
      expect(actual._id).toEqual('');
      expect(actual._updated).toEqual(noDate);
      expect(actual.name).toEqual('');
      expect(actual.toggle).toEqual(false);
      expect(actual.score).toEqual(0);
      expect(actual.average).toEqual(0.0);
      expect(actual.strArray).toEqual([]);
      expect(actual.$action).toEqual(RowAction.Create);
    });
    test('inits with object values', () => {
      const actual = new TestRow(testRowObject);
      expect(actual._row).toEqual(2);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
      expect(actual.$action).toEqual(RowAction.None);
    });
    test('inits with value array', () => {
      const actual = new TestRow(testRowValues);
      expect(actual._row).toEqual(0);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
      expect(actual.$action).toEqual(RowAction.Create);
    });
    test('inits with array of empty strings', () => {
      const actual = new TestRow(['', '', '', '', '', '', '']);
      expect(actual._row).toEqual(0);
      expect(actual._id).toEqual('');
      expect(actual._updated).toEqual(noDate);
      expect(actual.name).toEqual('');
      expect(actual.toggle).toEqual(false);
      expect(actual.score).toEqual(0);
      expect(actual.average).toEqual(0.0);
      expect(actual.strArray).toEqual([]);
    });
  });
  describe('assign', () => {
    test('with value array', () => {
      const actual = new TestRow();
      actual.assign(testRowValues);
      expect(actual._row).toEqual(0);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
    });
    test('with object', () => {
      const actual = new TestRow();
      actual.assign(testRowObject);
      expect(actual._row).toEqual(2);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
    });
    test('with toObject and fromObject', () => {
      const actual = new TestRow();
      actual.fromObject(testRowObject);
      expect(actual._row).toEqual(2);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
      const obj = actual.toObject();
      actual.fromObject(obj);
      expect(actual._row).toEqual(2);
      expect(actual._id).toEqual('3');
      expect(actual._updated).toEqual(testRowNow);
      expect(actual.name).toEqual(testRowObject.name);
      expect(actual.toggle).toEqual(true);
      expect(actual.score).toEqual(5);
      expect(actual.average).toEqual(3.2);
      expect(actual.strArray).toEqual(['a', 'b']);
    });
  });
  describe('prepare', () => {
    test('assigns empty id and updated', () => {
      const actual = new TestRow();
      expect(actual._row).toEqual(0);
      expect(actual._id).toEqual('');
      expect(actual._updated).toEqual(noDate);
      actual.prepare();
      expect(actual._row).toEqual(0);
      expect(actual._id).not.toEqual('');
      expect(actual._updated).not.toEqual(noDate);
    });
    test('updates updated without updating id', async () => {
      const id = 'baad-f00d';
      const actual = new TestRow({ _row: 1, _id: id });
      actual.prepare();
      expect(actual._row).toEqual(1);
      expect(actual._id).toEqual(id);
      expect(actual._updated).not.toEqual(noDate);
      const updated = actual._updated;
      jest.useFakeTimers();
      await null; // match delay from await func1()
      jest.advanceTimersByTime(1000);
      actual.prepare();
      expect(actual._row).toEqual(1);
      expect(actual._id).toEqual(id);
      expect(actual._updated.getTime()).not.toEqual(updated.getTime());
    });
  });
  describe('actions', () => {
    test('setCreate marks create action', () => {
      const actual = new TestRow();
      actual.setCreate();
      expect(actual.$action).toEqual(RowAction.Create);
    });
    test('setDelete marks delete action', () => {
      const actual = new TestRow({ _row: 2 });
      actual.setDelete();
      expect(actual.$action).toEqual(RowAction.Delete);
    });
    test('setUpdate marks update action', () => {
      const actual = new TestRow({ _row: 2 });
      actual.setUpdate();
      expect(actual.$action).toEqual(RowAction.Update);
    });
    test('Create action is rejected for existing row', () => {
      const actual = new TestRow({ _row: 2 });
      const expected = actual.$action;
      expect(actual.setCreate()).toEqual(false);
      expect(actual.$action).toEqual(expected);
      actual.$action = RowAction.Create;
      expect(actual.$action).toEqual(expected);
    });
    test('Delete action is rejected for new row', () => {
      const actual = new TestRow({ _row: 0 });
      const expected = actual.$action;
      expect(actual.setDelete()).toEqual(false);
      expect(actual.$action).toEqual(expected);
      actual.$action = RowAction.Delete;
      expect(actual.$action).toEqual(expected);
    });
    test('Update action is rejected for new row', () => {
      const actual = new TestRow({ _row: 0 });
      const expected = actual.$action;
      expect(actual.setUpdate()).toEqual(false);
      expect(actual.$action).toEqual(expected);
      actual.$action = RowAction.Update;
      expect(actual.$action).toEqual(expected);
    });
  });
});
