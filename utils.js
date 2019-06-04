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
const child_process_1 = require("child_process");
exports.utf8 = 'utf-8';
// Abstraction of log so it can be skipped when quiet mode is enabled
exports.log = (message) => console.log(message);
exports.quit = (err) => {
    console.error(`Error: ${err.name}, ${err.message}`);
    console.error(err.stack);
    process.exit(1);
    return ''; // spoof return type for TypeScript to not complain
};
exports.fail = (name, message) => {
    const err = new Error(message);
    err.name = name;
    return exports.quit(err);
};
exports.run = (command, args) => __awaiter(this, void 0, void 0, function* () {
    // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
    const options = {
        maxBuffer: 1024 * 2048,
        timeout: 300 * 1000,
        windowsHide: true,
        encoding: 'utf8',
    };
    try {
        // const result = await spawnSync(command, args, options)
        command += ' ' + args.join(' ');
        const result = child_process_1.execSync(command, options);
        return result;
    }
    catch (e) {
        return exports.quit(e);
    }
});
