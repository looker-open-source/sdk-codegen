#!/usr/bin/env node
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const targetLanguages_1 = require("./targetLanguages");
const sdkConfig_1 = require("./sdkConfig");
const utils_1 = require("./utils");
const convert_1 = require("./convert");
// perform the generation for specific API version, configuration, and language
const generate = (fileName, spec, props) => __awaiter(this, void 0, void 0, function* () {
    const path = spec.path ? spec.path : spec.language;
    const apiPath = `./api/${props.api_version}/${path}`;
    return utils_1.run('openapi-generator', ['generate', '-i', fileName, '-g', spec.language, '-o', apiPath, '--enable-post-process-file', spec.options]);
});
// generate all languages for the specified configuration
const runConfig = (name, props) => __awaiter(this, void 0, void 0, function* () {
    utils_1.log(`processing ${name} configuration ...`);
    const openApiFile = yield convert_1.logConvert(name, props);
    let results = [];
    targetLanguages_1.TargetLanguages.forEach((language) => __awaiter(this, void 0, void 0, function* () {
        const tag = `${name} API ${language.language} version ${props.api_version}`;
        utils_1.log(`generating ${tag} ...`);
        results.push(yield generate(openApiFile, language, props));
    }));
    return results;
});
try {
    const config = sdkConfig_1.SDKConfig();
    Object.entries(config).forEach(([name, props]) => __awaiter(this, void 0, void 0, function* () { return runConfig(name, props); }));
}
catch (e) {
    utils_1.quit(e);
}
