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

import { getSpecsFromVersions } from '@looker/sdk-codegen';
import { TestConfig } from './testUtils';
import {
  fetchLookerVersions,
  getVersionInfo,
  login,
  supportedVersion,
  logConvertSpec,
  fetchLookerVersion,
} from './fetchSpec';
import type { ISDKConfigProps } from './sdkConfig';

const config = TestConfig();
const props = config.section as unknown as ISDKConfigProps;
// api_version is no longer part of the INI, now set by sdkGen iterator
props.api_version = '4.0';

describe('fetch operations', () => {
  it('defaults lookerVersion when server is not responding', async () => {
    const testProps = JSON.parse(JSON.stringify(props));
    testProps.base_url = 'https://bogus-server.looker.com:99';
    const actual = await fetchLookerVersion(testProps, undefined, {
      timeout: 5,
    });
    expect(actual).toEqual('');
  }, 36000);

  it('gets lookerVersion with good server', async () => {
    const actual = await fetchLookerVersion(props);
    expect(actual).not.toEqual('');
  });

  it('gets lookerVersion with supplied versions', async () => {
    const actual = await fetchLookerVersion(props, {
      looker_release_version: '7.10.0',
    });
    expect(actual).toEqual('7.10');
  });

  it('gets version info', async () => {
    expect(props).toBeDefined();
    const version = await getVersionInfo(props);
    expect(version).toBeDefined();
    if (version) {
      expect(version.lookerVersion).toBeDefined();
      expect(version.spec).toBeDefined();
    }
  });

  it('can login', async () => {
    expect(props).toBeDefined();
    const token = await login(props);
    expect(token).toBeDefined();
  });

  it('get versions', async () => {
    expect(props).toBeDefined();
    const actual = await fetchLookerVersions(props);
    expect(actual).toBeDefined();
    const version: any = supportedVersion('4.0', actual);
    expect(version).toBeDefined();
    if (version) {
      expect(version.version).toEqual('4.0');
      expect(version.swagger_url).toBeDefined();
      // TODO enable when these values are surfaced in Looker
      // expect(version.swagger_min_url).toBeDefined()
      // expect(version.openapi_url).toBeDefined()
      // expect(version.openapi_min_url).toBeDefined()
    }
  });

  it('logConvertSpec', async () => {
    expect(props).toBeDefined();
    const name = 'Looker';
    const lookerVersions = await fetchLookerVersions(props);
    const specs = await getSpecsFromVersions(lookerVersions);
    const actual = await logConvertSpec(
      name,
      specs[props.api_version],
      lookerVersions,
      true
    );
    expect(actual).toBeDefined();
    expect(actual.length).toBeGreaterThan(0);
  });
});
