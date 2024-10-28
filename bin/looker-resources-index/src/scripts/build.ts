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

/* eslint no-console: "off" */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { resources } from '../resource-data/resources';
import type { Resource } from '../types';

main();

async function main() {
  // File paths are relative to built JS folder (/tmp/compiled-typesript)
  const resourcesPath = '../../../../../docs/resources/resources.json';
  const resourceLockPath = '../../../../../docs/resources/resource-lock.json';

  const priorResourcesBundle = tryJsonParse(await readFile(resourcesPath), {});
  const priorResources = (priorResourcesBundle.resources || []) as Resource[];
  const priorResourceLock = tryJsonParse(
    await readFile(resourceLockPath),
    undefined
  );

  if (priorResourceLock) {
    const modifiedResources = priorResources.filter(
      (r) => priorResourceLock[r.id] !== resourceDigest(r)
    );
    if (modifiedResources.length) {
      console.error(
        "The output resources.json file seems to have been manually edited. The following id's have unexpected values:"
      );
      modifiedResources.forEach((r) => console.error(' > ' + r.id));
      console.error(
        'After ensuring that all manually modified data is reflected in the resource source data, delete the resource-lock.json file and re-build'
      );
      process.exit(1);
    }
  }

  const resourcesLock = Object.fromEntries(
    resources.map((r) => [r.id, resourceDigest(r)])
  );

  console.log('Writing resources.json');
  await writeFile(resourcesPath, format(resources));
  console.log('Writing lockfile');
  await writeFile(
    resourceLockPath,
    JSON.stringify(resourcesLock, undefined, 2)
  );
  console.log('Done!');
}

function writeFile(fp: string, contents: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(
      path.resolve(__dirname, fp),
      contents,
      { encoding: 'utf-8' },
      (err) => {
        err ? reject(err) : resolve();
      }
    );
  });
}
function readFile(fp: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(
      path.resolve(__dirname, fp),
      { encoding: 'utf-8' },
      (err, str) => {
        err ? reject(err) : resolve(str);
      }
    );
  });
}

function format(resources: Resource[]): string {
  const sortedResources = resources.sort((a, b) => a.id.localeCompare(b.id)); // Sort by id
  return `{
	"resources":[
		${sortedResources.map(resourceToJson).join(',\n\t\t')}
	]
}`;
}

function resourceToJson(r: Resource) {
  const { id, ...rest } = r;
  return JSON.stringify({ id, ...rest });
}
function resourceDigest(r: Resource) {
  return crypto.createHash('sha1').update(resourceToJson(r)).digest('hex');
}
function tryJsonParse(str: string, dft: any) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return dft;
  }
}
