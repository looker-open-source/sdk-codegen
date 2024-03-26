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

import { danger, log, warn } from '@looker/sdk-codegen-utils';
import type { IVersionInfo, SpecItem } from '@looker/sdk-codegen';
import type { ITransportSettings } from '@looker/sdk-rtl';
import { defaultTimeout, sdkOk } from '@looker/sdk-rtl';
import { NodeTransport } from '@looker/sdk-node';
import {
  createJsonFile,
  fail,
  isFileSync,
  quit,
  readFileSync,
} from './nodeUtils';
import type { ISDKConfigProps } from './sdkConfig';
import { convertSpec } from './convert';

let transport: NodeTransport;

/**
 * Customize request transport properties for SDK codegen
 * @param props SDK configuration properties
 * @returns {NodeTransport} codegen-specific overrides
 * @constructor
 */
export const specTransport = (props: ISDKConfigProps) => {
  if (transport) return transport;
  const options: ITransportSettings = {
    agentTag: 'SDK Codegen',
    base_url: props.base_url,
    timeout: (props as unknown as any).timeout || defaultTimeout,
    verify_ssl: props.verify_ssl,
  };
  transport = new NodeTransport(options);
  return transport;
};

const loginUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/login`;

const logoutUrl = (props: ISDKConfigProps) =>
  `${props.base_url}/api/${props.api_version}/logout`;

export const supportedVersion = (version: string, versions: any) => {
  if (!('supported_versions' in versions)) {
    danger('Could not find supported versions');
    return undefined;
  }
  const found = Object.entries(versions.supported_versions).find(
    ([, value]) => (value as any).version === version
  );
  if (found) return found[1];
  return undefined;
};

export const specPath = 'spec';

export const swaggerFileName = (name: string, specKey: string) =>
  `${specPath}/${name}.${specKey}.json`;

export const openApiFileName = (name: string, specKey: string) =>
  `${specPath}/${name}.${specKey}.oas.json`;

/**
 * Is there an authentication error?
 * @param content response to check
 * @returns True if there's an authentication error
 */
const badAuth = (content: string | Record<string, unknown>) => {
  const text = typeof content === 'object' ? JSON.stringify(content) : content;
  return text.indexOf('Requires authentication') > 0;
};

export const logout = async (props: ISDKConfigProps, token: string) => {
  const xp = specTransport(props);

  return sdkOk<string, Error>(
    xp.request<string, Error>(
      'DELETE',
      logoutUrl(props),
      undefined,
      undefined,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  );
};

export const login = async (props: ISDKConfigProps) => {
  const xp = specTransport(props);
  const creds = {
    client_id: props.client_id ?? process.env.LOOKERSDK_CLIENT_ID,
    client_secret: props.client_secret ?? process.env.LOOKERSDK_CLIENT_SECRET,
  };
  const url = loginUrl(props);

  const response = await sdkOk<any, Error>(
    xp.request<any, Error>('POST', url, creds, undefined, undefined, undefined)
  );
  const accessToken = await response.access_token;

  if (accessToken) {
    return accessToken;
  } else {
    log(`Server Response: ${JSON.stringify(response)}`);
    throw new Error('Access token could not be retrieved.');
  }
};

const checkCertError = (err: Error): boolean => {
  if (err.message && err.message.match(/self signed certificate/gi)) {
    warn(`
NOTE! Certificate validation can be disabled with:
  NODE_TLS_REJECT_UNAUTHORIZED="0" {original command}
`);
    return true;
  }
  return false;
};

/**
 * gets either an http(s) url, or a file URL by reading directly if it's a file url
 * @param props SDK configuration props
 * @param url to fetch
 * @param options for transport call
 */
export const getUrl = async (
  props: ISDKConfigProps,
  url: string,
  options?: Partial<ITransportSettings>
) => {
  const ref = new URL(url);

  if (ref.protocol === 'file:') {
    return readFileSync(ref.pathname);
  }
  const xp = specTransport(props);
  return await sdkOk<string, Error>(
    xp.request('GET', url, undefined, undefined, undefined, options)
  );
};

export const authGetUrl = async (
  props: ISDKConfigProps,
  url: string,
  failQuits = true,
  options?: Partial<ITransportSettings>
) => {
  let token = null;
  let content: any = null;
  try {
    // Try first without login. Most Looker instances don't require auth for spec retrieval
    content = await getUrl(props, url, options);
  } catch (err: any) {
    if (err.message.indexOf('ETIMEDOUT') > 0) {
      throw err;
    }
    // Whoops!  Ok, try again with login
    token = await login(props);
    options = { options, ...{ headers: { Authorization: `Bearer ${token}` } } };
    content = await getUrl(props, url, options);
    if (token) {
      await logout(props, token);
    }
  }

  if (badAuth(content)) {
    const authFailed = 'Authentication failed';
    if (failQuits) {
      return quit(authFailed);
    } else {
      throw new Error(authFailed);
    }
  }
  return content;
};

export const fetchLookerVersions = async (
  props: ISDKConfigProps,
  options?: Partial<ITransportSettings>
) => {
  return await authGetUrl(props, `${props.base_url}/versions`, false, options);
};

export const fetchLookerVersion = async (
  props: ISDKConfigProps,
  versions?: any,
  options?: Partial<ITransportSettings>
) => {
  if (!versions) {
    try {
      versions = await fetchLookerVersions(props, options);
    } catch (e: any) {
      warn(
        `Could not retrieve looker release version from "${props.base_url}/versions": ${e.message}`
      );
      return '';
    }
  }
  const matches = versions.looker_release_version.match(/^\d+\.\d+/i);
  return matches[0];
};

export const fetchSpec = async (
  name: string,
  spec: SpecItem,
  props: ISDKConfigProps
) => {
  const fileName = swaggerFileName(name, spec.key);
  // No need to fetch if the file already exists
  // TODO make this a switch or remove caching?
  if (isFileSync(fileName)) return fileName;

  try {
    const content = await authGetUrl(props, spec.specURL || 'missing spec url');

    createJsonFile(fileName, content);

    return fileName;
  } catch (err: any) {
    checkCertError(err);
    return quit(err);
  }
};

export const logFetchSpec = async (
  name: string,
  spec: SpecItem,
  props: ISDKConfigProps
) => {
  const specFile = await fetchSpec(name, spec, props);
  if (!specFile) {
    return fail('fetchSpec', 'No specification file name returned');
  }
  return specFile;
};

export const getVersionInfo = async (
  props: ISDKConfigProps
): Promise<IVersionInfo | undefined> => {
  try {
    const lookerVersion = await fetchLookerVersion(props);
    return {
      spec: {
        key: props.api_version,
        version: props.api_version,
        isDefault: false,
        status: 'mocked',
      },
      lookerVersion,
    };
  } catch (e: any) {
    warn(
      `Could not retrieve version information. Is ${props.base_url} running?`
    );
    checkCertError(e);
    console.error({ e });
  }
  return undefined;
};

/**
 * Fetch (if needed) and convert a Swagger API specification to OpenAPI
 * @param name base name of the target file
 * @param spec specification derived
 * @param props SDK configuration properties to use
 * @param force true to force re-conversion of the spec
 * @returns {Promise<string>} name of converted OpenAPI file
 */
export const logConvertSpec = async (
  name: string,
  spec: SpecItem,
  props: ISDKConfigProps,
  force = false
) => {
  // if openApiFile is resolved correctly, this value will be the file name
  let result = '';
  const oaFile = openApiFileName(name, spec.key);
  if (isFileSync(oaFile) && !force) return oaFile;

  const specFile = await logFetchSpec(name, spec, props);
  result = convertSpec(specFile, oaFile, force);
  if (!result) {
    return fail('logConvert', 'No file name returned for openAPI upgrade');
  }

  return result;
};
