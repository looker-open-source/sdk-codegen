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

import * as fs from 'fs';
import * as path from 'path';
import { cred, initSheetSDK, sheetTimeout } from './testUtils/testUtils';
import type { SheetSDK } from './SheetSDK';
import { tabName } from './SheetSDK';
let sheets: SheetSDK;

describe('SheetSDK', () => {
  beforeAll(async () => {
    sheets = await initSheetSDK();
  });

  test(
    'can get sheet',
    async () => {
      const actual = await sheets.read();
      expect(actual).toBeDefined();
      expect(actual.spreadsheetId).toEqual(cred.sheet_id);
      expect(actual.properties).toBeDefined();
      expect(actual.sheets).toBeDefined();
      expect(actual.sheets.length).toBeGreaterThan(0);
      expect(actual.spreadsheetUrl).toBeDefined();
    },
    sheetTimeout
  );
  // test('can get default sheet values', async () => {
  //   const actual = await sheets.values()
  //   expect(actual).toBeDefined()
  //   expect(actual.length).toBeGreaterThan(0)
  //   expect(actual[0].length).toBeGreaterThan(0)
  // })
  // test('can get sheet tab values', async () => {
  //   for (const sheet of doc.sheets) {
  //     const actual = await sheets.tabValues(sheet.properties.title)
  //     expect(actual).toBeDefined()
  //     expect(actual.length).toBeGreaterThan(0)
  //   }
  // })
  test(
    'can index tab values',
    async () => {
      const actual = await sheets.index();
      expect(actual).toBeDefined();
      expect(actual.sheets.length).toBeGreaterThan(0);
      expect(Object.entries(actual.tabs).length).toEqual(actual.sheets.length);
      actual.sheets.forEach(t => {
        const tab = actual.tabs[tabName(t)];
        expect(tab).toBeDefined();
        expect(tab.header).toBeDefined();
        expect(tab.header.length).toBeGreaterThan(0);
        // No empty data rows
        tab.rows.forEach(row => {
          expect(Object.keys(row).length).toBeGreaterThan(0);
          expect(row._row).toBeGreaterThan(0);
        });
      });
      const sheetFile = path.join(__dirname, '/', 'tabs.json');
      const json = JSON.stringify(actual.tabs, null, 2);
      fs.writeFileSync(sheetFile, json, {
        encoding: 'utf-8',
      });
    },
    sheetTimeout
  );
});
