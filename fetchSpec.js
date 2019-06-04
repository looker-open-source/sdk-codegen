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
const node_fetch_1 = require("node-fetch");
const sdkConfig_1 = require("./sdkConfig");
const url_1 = require("url");
const fs = require("fs");
const utils_1 = require("./utils");
const specFileUrl = (props) => `${props.base_url}/api/${props.api_version}/swagger.json`;
const loginUrl = (props) => `${props.base_url}/login`;
const logoutUrl = (props) => `${props.base_url}/logout`;
const logout = (props, token) => __awaiter(this, void 0, void 0, function* () { return node_fetch_1.default(logoutUrl(props), { method: 'DELETE', headers: { 'Authorization': `token ${token}` } }); });
const login = (props) => __awaiter(this, void 0, void 0, function* () {
    const params = new url_1.URLSearchParams();
    params.append('client_id', props.client_id);
    params.append('client_secret', props.client_secret);
    try {
        const response = yield node_fetch_1.default(loginUrl(props), { method: 'POST', body: params });
        const body = yield response.json();
        const accessToken = yield body.access_token;
        if (accessToken) {
            return accessToken;
        }
        else {
            console.log("Server Response: ", body);
            throw new Error("Access token could not be retrieved.");
        }
    }
    catch (err) {
        console.error(err);
    }
});
exports.specFileName = (name, props) => `./${name}.${props.api_version}.json`;
exports.openApiFileName = (name, props) => `./${name}.${props.api_version}.oas.json`;
exports.fetchSpecFile = (name, props) => __awaiter(this, void 0, void 0, function* () {
    const fileName = exports.specFileName(name, props);
    // TODO make switch for "always fetch"
    if (fs.existsSync(fileName))
        return fileName;
    try {
        const token = yield login(props);
        const response = yield node_fetch_1.default(specFileUrl(props), { headers: { 'Authorization': `token ${token}` } });
        const content = yield response.text();
        fs.writeFileSync(fileName, content);
        yield logout(props, token);
        return fileName;
    }
    catch (err) {
        console.log(err);
        return;
    }
});
exports.logFetch = (name, props) => __awaiter(this, void 0, void 0, function* () {
    const specFile = yield exports.fetchSpecFile(name, props);
    if (!specFile) {
        return utils_1.fail('fetchSpecFile', 'No specification file name returned');
    }
    utils_1.log(`${specFile} exists.`);
    return specFile;
});
try {
    const config = sdkConfig_1.SDKConfig();
    Object.entries(config).forEach(([name, props]) => __awaiter(this, void 0, void 0, function* () { return exports.logFetch(name, props); }));
}
catch (e) {
    utils_1.quit(e);
}
