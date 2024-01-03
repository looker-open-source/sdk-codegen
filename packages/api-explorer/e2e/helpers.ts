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

/**
 * Constants
 */
export const BASE_URL = 'https://localhost:8080';
export const v31Url = `${BASE_URL}/3.1`;
export const v40Url = `${BASE_URL}/4.0`;

/**
 * Reloads the page, waiting for for the DomContentLoaded event before resolving
 */
export const pageReload = async (): Promise<void> => {
  await page.reload({ waitUntil: ['domcontentloaded', 'networkidle0'] });
};

/**
 * Navigates to the given url, waiting for the DomContentLoaded event before resolving
 * @param url url to navigate to
 */
export const goToPage = async (url: string): Promise<void> => {
  await page.goto(url, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 120000,
  });
};

/**
 * Gets the key of the selected spec
 */
export const getSpecKey = async (): Promise<string> => {
  const specSelectorHandle = await page.$('input[aria-label="spec selector"]');
  const specKey = await page.evaluate((e) => e.value, specSelectorHandle);
  return specKey;
};
