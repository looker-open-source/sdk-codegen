"use strict";
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var sdkGenerator_1 = require("./sdkGenerator");
var fs = require("fs");
var yaml = require("js-yaml");
var constants_1 = require("../../typescript/looker/rtl/constants");
var nodeSettings_1 = require("../../typescript/looker/rtl/nodeSettings");
/**
 * Reads configuration information, returning various test values
 * @param {string} rootPath
 * @returns {{testConfig: {[p: string]: any}; localIni: string; baseUrl: any; testData: any; apiVersion: any; testIni: string; configContents: string; rootPath: string; testSection: any; timeout: number}}
 * @constructor
 */
function TestConfig(rootPath) {
    if (rootPath === void 0) { rootPath = ''; }
    var testFile = 'test/data.yml';
    if (!rootPath) {
        rootPath = fs.existsSync(testFile) ? '' : '../../';
    }
    var localIni = process.env['LOOKERSDK_INI'] || rootPath + "looker.ini";
    var testPath = rootPath + "test/";
    var dataFile = testPath + "data.yml";
    var testData = yaml.safeLoad(fs.readFileSync(dataFile, constants_1.utf8));
    var testIni = "" + rootPath + testData['iniFile'];
    var configContents = fs.readFileSync(localIni, constants_1.utf8);
    var config = nodeSettings_1.ApiConfig(configContents);
    var section = config['Looker'];
    var baseUrl = section['base_url'];
    var timeout = parseInt(section['timeout'], 10);
    var testContents = fs.readFileSync(testIni, constants_1.utf8);
    var testConfig = nodeSettings_1.ApiConfig(testContents);
    var testSection = testConfig['Looker'];
    return {
        rootPath: rootPath,
        testPath: testPath,
        dataFile: dataFile,
        localIni: localIni,
        baseUrl: baseUrl,
        timeout: timeout,
        testData: testData,
        testIni: testIni,
        configContents: configContents,
        config: config,
        section: section,
        testConfig: testConfig,
        testSection: testSection,
    };
}
exports.TestConfig = TestConfig;
var config = TestConfig();
exports.apiTestModel = sdkGenerator_1.specFromFile(config.testPath + "openApiRef.json");
