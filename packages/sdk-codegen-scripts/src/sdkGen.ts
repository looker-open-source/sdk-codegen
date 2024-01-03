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
import path from 'path';
import { danger, log, warn } from '@looker/sdk-codegen-utils';
import type { IVersionInfo } from '@looker/sdk-codegen';
import {
  FunctionGenerator,
  HookGenerator,
  InterfaceGenerator,
  MethodGenerator,
  StreamGenerator,
  TypeGenerator,
} from './sdkGenerator';
import { FilesFormatter } from './reformatter';
import { isDirSync, quit } from './nodeUtils';
import { getGenerator } from './languages';
import { loadSpecs, prepGen } from './utils';

const formatter = new FilesFormatter();

/**
 * Writes the source code file and registers it with the file reformatter for processing
 * @param fileName name of source file
 * @param content contents to (over) write into source file
 * @returns the name of the file written
 */
export const writeCodeFile = (fileName: string, content: string): string => {
  const filePath = path.dirname(fileName);
  if (!isDirSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  fs.writeFileSync(fileName, content);
  formatter.addFile(fileName);
  return fileName;
};
(async () => {
  let config;
  try {
    config = await prepGen(process.argv.slice(2));
  } catch (e: any) {
    quit(e);
  }
  if (!config) return;
  const { props, languages, lookerVersion, lastApi, noStreams, useHooks } =
    config;

  // load the specifications and create the unique keys in case of spec API version overlap
  const specs = await loadSpecs(config);
  const apis = config.apis;
  log(`generating ${languages.join(',')} SDKs for APIs ${apis}`);

  try {
    for (const language of languages) {
      for (const api of apis) {
        const spec = specs[api];
        const versions: IVersionInfo = {
          spec,
          lookerVersion,
        };
        const apiModel = spec.api;
        if (!apiModel) {
          danger(
            `Could not fetch or compile apiModel for ${api} ${spec.specURL}`
          );
          continue;
        }
        const gen = getGenerator(language, apiModel, versions);
        if (!gen) {
          danger(`${language} does not have a code generator defined`);
          continue;
        }
        if (api !== lastApi && !gen.supportsMultiApi()) {
          danger(
            `skipping API ${api} for ${language} because it doesn't support multiple API versions`
          );
          continue;
        }
        log(`generating ${language} from ${props.base_url} ${api} ...`);
        log(`generating ${api} methods ...`);

        if (gen.useFunctions) {
          log(`generating ${api} functions ...`);
          const s = new FunctionGenerator(apiModel, gen);
          const output = s.render(gen.indentStr, noStreams);
          writeCodeFile(gen.sdkFileName(`funcs`), output);
        }

        if (gen.useSlices && useHooks) {
          log(`generating ${api} hooks and slices ...`);
          const s = new HookGenerator(apiModel, gen);
          const output = s.render(gen.indentStr, noStreams);
          writeCodeFile(gen.sdkFileName(`hooks`), output);
        }

        if (gen.useInterfaces) {
          log(`generating ${api} interfaces ...`);
          const s = new InterfaceGenerator(apiModel, gen);
          const output = s.render(gen.indentStr, noStreams);
          writeCodeFile(gen.sdkFileName(`methodsInterface`), output);
        }

        // Generate standard method declarations
        const sdk = new MethodGenerator(apiModel, gen);
        let output = sdk.render(gen.indentStr, noStreams);
        writeCodeFile(gen.sdkFileName(`methods`), output);

        if (gen.willItStream) {
          if (noStreams) {
            warn(`SKIPPING ${api} streaming methods ...`);
          } else {
            // Generate streaming method declarations
            log(`generating ${api} streaming methods ...`);
            const s = new StreamGenerator(apiModel, gen);
            const output = s.render(gen.indentStr, noStreams);
            writeCodeFile(gen.sdkFileName(`streams`), output);
          }
        }

        log(`generating ${api} models ...`);
        const types = new TypeGenerator(apiModel, gen);
        output = types.render('', noStreams);
        writeCodeFile(gen.sdkFileName(`models`), output);
        if (api === lastApi) {
          formatter.versionStamp(gen);
        }
      }
    }
    // finally, reformat all the files that have been generated
    formatter.reformat();
  } catch (e: any) {
    quit(e);
  }
})();
