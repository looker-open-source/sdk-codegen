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
import type { ILookerVersions } from '@looker/sdk-codegen';
import { BrowserTransport, DefaultSettings } from '@looker/sdk-rtl';

import type { RunItValues } from '../..';

export const RunItConfigKey = 'RunItConfig';
export const RunItFormKey = 'RunItForm';
export const RunItNoConfig = { base_url: '', looker_url: '' };

/**
 * Use the browser transport to GET a url
 * @param url to fetch
 */
export const getUrl = async (url: string): Promise<string | RunItValues> => {
  const settings = {
    ...DefaultSettings(),
    ...{ base_url: url, verify_ssl: false },
  };
  const xp = new BrowserTransport(settings);
  const response = await xp.rawRequest('GET', url);
  return response.body;
};

/**
 * Gets the versions payload given a versions url
 * @param versionsUrl
 */
export const getVersions = async (
  versionsUrl: string
): Promise<ILookerVersions | undefined> => {
  let versions;
  try {
    const content = await getUrl(versionsUrl);
    versions = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    throw new Error('Invalid server configuration');
  }
  return versions;
};

/**
 * Validates URL and standardizes it
 * @param url to validate
 * @returns the standardized url.origin if it's valid, or an empty string if it's not
 */
export const validateUrl = (url: string): string => {
  try {
    const result = new URL(url);
    if (url.endsWith(':')) return url;
    return result.origin;
  } catch {
    return '';
  }
};
