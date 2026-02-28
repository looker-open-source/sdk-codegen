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

export const mockExternalResources = async (): Promise<void> => {
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('examplesIndex.json')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          commitHash: 'hash',
          remoteOrigin: 'https://github.com/looker-open-source/sdk-codegen',
          summaries: {
            'examples/python/all_dashboards.py': {
              sourceFile: 'examples/python/all_dashboards.py',
              summary: 'Get All Dashboards',
            },
            'examples/python/me.py': {
              sourceFile: 'examples/python/me.py',
              summary: 'Get Current User',
            },
          },
          nuggets: {
            all_dashboards: {
              operationId: 'all_dashboards',
              calls: {
                '.py': [
                  {
                    sourceFile: 'examples/python/all_dashboards.py',
                    line: 10,
                  },
                ],
              },
            },
            me: {
              operationId: 'me',
              calls: {
                '.py': [
                  {
                    sourceFile: 'examples/python/me.py',
                    line: 5,
                  },
                ],
              },
            },
            content_metadata: {
              operationId: 'content_metadata',
              calls: {
                '.py': [
                  {
                    sourceFile: 'examples/python/content_metadata.py',
                    line: 5,
                  },
                ],
              },
            },
          },
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else if (request.url().includes('/err/')) {
      const urlParts = request.url().split('/');
      const errorCode = urlParts.find(part => /^\d{3}$/.test(part)) || '400';
      request.respond({
        status: 200,
        contentType: 'text/markdown',
        body: `## API Response ${errorCode} for `,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      request.continue();
    }
  });
};

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
export const injectToken = async (): Promise<void> => {
  const clientId = process.env.LOOKER_CLIENT_ID;
  const clientSecret = process.env.LOOKER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // eslint-disable-next-line no-console
    console.warn(
      'LOOKER_CLIENT_ID or LOOKER_CLIENT_SECRET not set. Skipping token injection.'
    );
    return;
  }

  // Go to the base URL (or login page) to ensure we are on the correct origin
  await goToPage(BASE_URL);

  try {
    await page.evaluate(
      (clientId, clientSecret, baseUrl) => {
        return fetch(`${baseUrl}/api/4.0/login`, {
          method: 'POST',
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
          }),
        })
          .then(response => {
            if (!response.ok) {
              return response.text().then(text => {
                throw new Error(
                  `Token fetch failed: ${response.status} ${response.statusText} - ${text}`
                );
              });
            }
            return response.json();
          })
          .then(token => {
            sessionStorage.setItem('LOOKER_TEST_TOKEN', JSON.stringify(token));
            return token;
          });
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.LOOKER_CLIENT_ID!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.LOOKER_CLIENT_SECRET!,
      BASE_URL
    );

    const token = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('LOOKER_TEST_TOKEN') || 'null');
    });

    if (token) {
      await page.setExtraHTTPHeaders({
        Authorization: `Bearer ${token.access_token}`,
      });
    } else {
      throw new Error('Token injection failed: Session storage empty');
    }

    // Reload to pick up the token and headers
    await page.reload({ waitUntil: ['domcontentloaded', 'networkidle0'] });

    // Wait for app to load
    try {
      await page.waitForSelector('input[aria-label="sdk language selector"]', {
        timeout: 30000,
      });
    } catch (e) {
      const title = await page.title();
      const url = await page.url();
      // eslint-disable-next-line no-console
      console.warn(`App not found.\nURL: ${url}\nTitle: ${title}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to inject token:', error);
  }
};

export const getSpecKey = async (): Promise<string> => {
  const specSelectorHandle = await page.$('input[aria-label="spec selector"]');
  const specKey = await page.evaluate(e => e.value, specSelectorHandle);
  return specKey;
};

export const ensureSdkSelected = async (language: string): Promise<void> => {
  const selector = `input[aria-label="sdk language selector"][value="${language}"]`;
  const isSelected = await page.$(selector);
  if (!isSelected) {
    const input = await page.$('input[aria-label="sdk language selector"]');
    if (input) {
      await input.click();
      try {
        const option = await page.waitForXPath(
          `//li[contains(., "${language}")]`,
          { timeout: 5000 }
        );
        if (option) {
          await option.click();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to find SDK option for ${language}`, e);
      }
      // Wait for selection to apply
      await page.waitForTimeout(1000);
    } else {
      // eslint-disable-next-line no-console
      console.error('SDK selector input not found');
    }
  }
};
