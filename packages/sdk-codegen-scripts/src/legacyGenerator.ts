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

import { log } from '@looker/sdk-codegen-utils';
import type { IGeneratorSpec, IApiVersion } from '@looker/sdk-codegen';
import { getSpecsFromVersions, legacyLanguages } from '@looker/sdk-codegen';
import type { ISDKConfigProps } from './sdkConfig';
import { run } from './nodeUtils';
import { fetchLookerVersions, logConvertSpec } from './fetchSpec';

/**
 * Returns the last version in the .ini api_versions comma-delimited list
 * @param {ISDKConfigProps} props
 * @returns {string}
 */
const defaultApiVersion = (props: ISDKConfigProps) => {
  const versions = (props.api_versions || '4.0').split(',');
  return versions[versions.length - 1];
};

/**
 * Generate API bindings with the OpenAPI legacy code generator
 * DEPRECATED: This is using the legacy code generator perform the generation for specific API version, configuration,
 * and language
 *
 * @param {string} fileName specification file name
 * @param {IGeneratorSpec} spec for language generator options
 * @param {ISDKConfigProps} props SDK configuration properties
 * @returns {Promise<Buffer | string>}
 */
const generate = async (
  fileName: string,
  spec: IGeneratorSpec,
  props: ISDKConfigProps
) => {
  const path = spec.path ? spec.path : spec.language;
  const language = spec.legacy ? spec.legacy : spec.language;
  const apiVersion = defaultApiVersion(props);
  const apiPath = `./api/${apiVersion}/${path}`;
  const options = spec.options || '';
  return run('openapi-generator-cli', [
    'generate',
    '-i',
    fileName,
    '-g',
    language,
    '-o',
    apiPath,
    '--enable-post-process-file',
    options,
  ]);
};

/**
 * Generate all languages for the specified configuration
 * @param name configuration name
 * @param props SDK configuration properties
 * @param targets Optional array of languages to generate
 * @returns generation promises
 */
export const runConfig = async (
  name: string,
  props: ISDKConfigProps,
  targets: string[] = []
) => {
  log(`processing ${name} configuration ...`);
  const apiVersion = defaultApiVersion(props);
  props.api_version = apiVersion;
  const lookerVersions = await fetchLookerVersions(props);
  const specs = await getSpecsFromVersions(lookerVersions as IApiVersion);
  const openApiFile = await logConvertSpec(name, specs[apiVersion], props);
  const languages = legacyLanguages();

  const results: any[] = [];
  for (const language of languages) {
    if (
      targets.length === 0 ||
      targets.find((t) => t.localeCompare(language.language) === 0)
    ) {
      const tag = `${name} API ${language.language} version ${apiVersion}`;
      log(`generating ${tag} ...`);
      results.push(await generate(openApiFile, language, props));
    }
  }

  return results;
};
