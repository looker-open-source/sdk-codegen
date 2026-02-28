/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
  goToPage,
  v40Url as v40,
  v40Url,
  injectToken,
  ensureSdkSelected,
  mockExternalResources,
} from './helpers';

jest.setTimeout(120000);

describe('MethodScene', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser();
    await page.setDefaultNavigationTimeout(120000);
    await injectToken();
    await mockExternalResources();
    await ensureSdkSelected('Python');
  });

  afterEach(async () => {
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  it('fetches error detail markdown when error code query param is present', async () => {
    const errorCode = '400';
    await goToPage(`${v40Url}/methods/Content/content_metadata?e=${errorCode}`);

    // confirm method scene loaded
    await expect(page).toMatchElement('h2', { text: 'Get Content Metadata' });

    // confirm correct response tab is selected
    await expect(page).toMatchElement('button[aria-selected=true]', {
      text: '400: Bad Request',
    });
    // confirm error detail md file was fetched
    await expect(page).toMatchElement('h2', {
      text: `API Response ${errorCode} for `,
    });
  });

  it('removes error code query param when user navigates away from method', async () => {
    const errorCode = 400;
    await goToPage(
      `${v40}/err/${errorCode}/get/content_metadata/:content_metadata_id`
    );

    // confirm method scene loaded
    await expect(page).toMatchElement('h2', { text: 'Get Content Metadata' });

    // confirm url and query param are set correctly
    await expect(page.url()).toEqual(
      `${v40}/methods/Content/content_metadata?sdk=py&e=${errorCode}`
    );

    // navigate to another method
    await expect(page).toClick('h4', { text: 'Dashboard' });
    await expect(page).toMatchElement('h2', {
      text: 'Dashboard: Manage Dashboards',
    });
    await expect(page.url()).toEqual(`${v40}/methods/Dashboard?sdk=py`);
  });
});
