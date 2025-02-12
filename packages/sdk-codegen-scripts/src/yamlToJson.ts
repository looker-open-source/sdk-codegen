/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import * as yaml from 'js-yaml';
import { quit } from './nodeUtils';

/* eslint-disable no-console */

/**
 * Use this script to convert any valid YAML file to pretty-printed JSON
 */
const utf8 = 'utf-8';
const args = process.argv.slice(2);
if (args.length < 1) {
  quit('Yaml file name is required');
}

const yamlFile = args[0];
const jsonFile = args.length > 1 ? args[1] : yamlFile + '.json';

const data = yaml.load(fs.readFileSync(yamlFile, utf8));
const json = JSON.stringify(data, undefined, 2);
fs.writeFileSync(jsonFile, json, utf8);
console.log(`Converted ${yamlFile} to ${jsonFile}`);
