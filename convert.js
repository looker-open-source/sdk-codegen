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
const fs = require("fs");
const sdkConfig_1 = require("./sdkConfig");
const fetchSpec_1 = require("./fetchSpec");
const utils_1 = require("./utils");
const lintCheck = (fileName) => __awaiter(this, void 0, void 0, function* () {
    // TODO skip if flag to ignore lint errors is specified
    try {
        const linter = yield utils_1.run('speccy', ['lint', fileName]);
        if (!linter)
            return utils_1.fail('Lint', 'no response');
        if (linter.indexOf('Specification is valid, with 0 lint errors') >= 0)
            return;
        return utils_1.fail('Lint', linter.toString());
    }
    catch (e) {
        return utils_1.quit(e);
    }
});
const convertSpec = (fileName, openApiFile) => __awaiter(this, void 0, void 0, function* () {
    if (fs.existsSync(openApiFile)) {
        utils_1.log(`${openApiFile} already exists.`);
        return openApiFile;
    }
    try {
        // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
        // patch to fix up small errors in source definition (not required, just to ensure smooth process)
        // indent 2 spaces
        // output to openApiFile
        yield utils_1.run('swagger2openapi', [fileName, '-p', '-i', '"  "', '-o', openApiFile]);
        if (!fs.existsSync(openApiFile))
            return utils_1.fail('convertSpec', `creating ${openApiFile} failed`);
        return openApiFile;
    }
    catch (e) {
        return utils_1.quit(e);
    }
});
// generate all languages for the specified configuration
exports.logConvert = (name, props) => __awaiter(this, void 0, void 0, function* () {
    const specFile = yield fetchSpec_1.logFetch(name, props);
    const openApiFile = yield convertSpec(specFile, fetchSpec_1.openApiFileName(name, props));
    if (!openApiFile) {
        return utils_1.fail('logConvert', 'No file name returned for openAPI upgrade');
    }
    utils_1.log(`${openApiFile} conversion is complete.`);
    yield lintCheck(openApiFile);
    utils_1.log(`${openApiFile} lint check passed.`);
    return openApiFile;
});
try {
    const config = sdkConfig_1.SDKConfig();
    Object.entries(config).forEach(([name, props]) => __awaiter(this, void 0, void 0, function* () { return exports.logConvert(name, props); }));
}
catch (e) {
    utils_1.quit(e);
}
