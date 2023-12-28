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

import type { ILookerVersions, SpecItem } from "@looker/sdk-codegen";
import {
  ApiModel,
  codeGenerators,
  findGenerator,
  getSpecsFromVersions,
  upgradeSpecObject,
} from "@looker/sdk-codegen";
import { log } from "@looker/sdk-codegen-utils";
import { createJsonFile, readFileSync } from "./nodeUtils";
import type { ISDKConfigProps } from "./sdkConfig";
import { SDKConfig } from "./sdkConfig";
import {
  authGetUrl,
  fetchLookerVersion,
  fetchLookerVersions,
  openApiFileName,
  specPath,
  swaggerFileName,
} from "./fetchSpec";

export const apiVersions = (props: any) => {
  const versions = props.api_versions ?? "3.1,4.0";
  return versions.split(",");
};

export interface IGenProps {
  /** Languages to generate */
  languages: string[];
  /** name of first INI config section, used for package name */
  name: string;
  /** SDK config properties from the first section */
  props: ISDKConfigProps;
  /** api specifications */
  lookerVersions: ILookerVersions;
  /** Release version */
  lookerVersion: string;
  /** Api version collection */
  apis: string[];
  /** Last API version */
  lastApi: string;
  /** Skip generating streams files? */
  noStreams: boolean;
}

const generatorHelp = () => {
  log(
    `sdkGen [languages...] [-v|--versions <versions file>] [-n|--nostreams] [-h|--help]
  languages...:   zero or more language specifiers separated by space or comma. Defaults to all supported languages.
  -v|--versions:  location of a JSON versions file in ILookerVersions format to read for getting specs
  -n|--nostreams: skip generation of a language SDK 'streams' files (if it supports streaming)
  -h|--help:      display this output

  examples:
    # Generates all supported SDKs
    yarn gen

    # Generates TypeScript and Python SDKs
    yarn gen ts,py

    # reads specs from './versions.json' and generates TypeScript and Python SDKs
    yarn gen ts -v ./versions.json py
`,
  );
  process.exit(0);
};

/**
 * Process command-line switches for versions payload and languages
 * @param args
 */
export const doArgs = (args: string[]) => {
  let versions: ILookerVersions | undefined;
  let noStreams = false;

  const langs: string[] = [];
  if (args.length > 0 && args.toString().toLowerCase() !== "all") {
    let i = 0;
    while (i < args.length) {
      const arg = args[i].toLowerCase();
      switch (arg) {
        case "-v":
        case "--versions":
          {
            i++;
            const content = readFileSync(args[i]);
            versions = JSON.parse(content);
          }
          break;
        case "-h":
        case "--help":
          generatorHelp();
          break;
        case "-n":
        case "--nostreams":
          noStreams = true;
          break;
        default:
          {
            const values = arg.split(",").filter((v) => v.trim());
            if (values[0] !== "all") {
              values.forEach((v) => {
                const gen = findGenerator(v.trim());
                if (gen) {
                  // Valid language match
                  langs.push(gen.language);
                } else {
                  throw new Error(`"${v}" is not a valid option`);
                }
              });
            }
          }
          break;
      }
      i++;
    }
  }

  // Default languages to all
  const languages = (
    langs.length > 0
      ? langs
      : codeGenerators
          .filter((l) => l.factory !== undefined)
          .map((l) => l.language)
  ).filter((value, index, all) => all.indexOf(value) === index);

  return { languages, versions, noStreams };
};

/**
 * Load the default configuration settings from looker.ini
 */
export const loadConfig = () => {
  const config = SDKConfig();
  const [name, props] = Object.entries(config)[0];
  return { name, props };
};

/**
 * Prepare the generator configuration from all configuration options and return the config
 * @param args command-line style arguments to parse.
 */
export const prepGen = async (args: string[]): Promise<IGenProps> => {
  const { languages, versions, noStreams } = doArgs(args);
  const { name, props } = loadConfig();
  let lookerVersions;
  let lookerVersion = "";
  try {
    if (versions) {
      lookerVersions = versions;
    } else {
      lookerVersions = await fetchLookerVersions(props);
      createJsonFile(
        `${specPath}/versions.json`,
        JSON.stringify(lookerVersions, null, 2),
      );
    }
    lookerVersion = await fetchLookerVersion(props, lookerVersions);
  } catch {
    // Looker server is not required, so default values for the generator
    lookerVersions = {
      supported_versions: [
        {
          version: "3.1",
          status: "stable",
          full_version: "",
          swagger_url: `https://${props.base_url}/api/3.1/swagger.json`,
        },
        {
          version: "4.0",
          status: "experimental",
          full_version: "",
          swagger_url: `https://${props.base_url}/api/4.0/swagger.json`,
        },
      ],
    };
    lookerVersion = "";
  }
  // Iterate through all specified API versions
  const apis = apiVersions(props);
  const lastApi = apis[apis.length - 1];

  return {
    name,
    props,
    languages,
    lookerVersions: lookerVersions as ILookerVersions,
    lookerVersion,
    apis,
    lastApi,
    noStreams,
  };
};

/**
 * Load and save specifications from the versions file
 * @param config generation configuration properties
 * @param fetch false to skip fetching the spec, true to fetch. Defaults to true
 */
export const loadSpecs = async (config: IGenProps, fetch = true) => {
  const specFetch = async (spec: SpecItem) => {
    if (!fetch) return undefined;
    if (!spec.specURL) return undefined;
    const p = { ...config.props, ...{ api_version: spec.version } };
    let source = await authGetUrl(p, spec.specURL);
    if (typeof source === "string") source = JSON.parse(source);
    const upgrade = upgradeSpecObject(source);
    spec.api = ApiModel.fromJson(upgrade);
    if (/^http[s]?:\/\//i.test(spec.specURL)) {
      const swagger = JSON.stringify(source, null, 2);
      const oas = JSON.stringify(upgrade, null, 2);
      const swaggerName = swaggerFileName(config.name, spec.key);
      const oaName = openApiFileName(config.name, spec.key);
      createJsonFile(swaggerName, swagger);
      createJsonFile(oaName, oas);
      log(`fetched and saved ${swaggerName} and converted it to ${oaName}`);
    }
    return spec.api;
  };

  const specs = await getSpecsFromVersions(config.lookerVersions, specFetch);
  // NOTE: Reaching in and updating the api versions list from established spec keys
  config.apis = Object.keys(specs);

  return specs;
};
