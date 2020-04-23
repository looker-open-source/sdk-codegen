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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ini = require("ini");
var apiSettings_1 = require("./apiSettings");
var constants_1 = require("./constants");
var transport_1 = require("./transport");
/**
 * Read an environment key. Use defaultValue if it doesn't exist
 * @param {string} name Environment variable name
 * @param {string | undefined} defaultValue
 * @returns {string | undefined} The value of the environment variable if it exists, or defaultValue
 */
exports.getenv = function (name, defaultValue) {
    if (defaultValue === void 0) { defaultValue = undefined; }
    var val = process.env[name];
    return val === undefined ? defaultValue : val;
};
/**
 * Parses `.ini` formatted content
 * @param contents formatted as an `.ini` file
 * @constructor
 */
exports.ApiConfig = function (contents) { return ini.parse(contents); };
/**
 * Extract named or (default) first section from INI file
 * @param contents {string} Parameters formatted as an INI file
 * @param section {[key: string]: any;} Contents of INI section
 * @constructor
 */
exports.ApiConfigSection = function (contents, section) {
    var config = exports.ApiConfig(contents);
    if (!section) {
        // default to the first section if not specified
        section = Object.keys(config)[0];
    }
    var settings = config[section];
    if (!settings) {
        throw new Error("No section named \"" + section + "\" was found");
    }
    if (settings.api_version) {
        console.warn("api_version is no longer read from a configuration file by the SDK");
    }
    return settings;
};
/**
 * A utility function that loads environment variables and maps them to the standard configuration values
 *
 * @returns the populated `IApiSection`, which may be empty
 */
var readEnvConfig = function () {
    var values = {};
    Object.keys(apiSettings_1.ApiConfigMap).forEach(function (key) {
        var envKey = apiSettings_1.ApiConfigMap[key];
        if (process.env[envKey] !== undefined) {
            // Value exists. Map environment variable keys to config variable keys
            values[key] = constants_1.unquote(process.env[envKey]);
        }
    });
    return values;
};
/**
 * A utility function that loads the configuration values from the specified file name and overrides them
 * with environment variable values, if the environment variables exist
 *
 * @param {string} fileName Name of configuration file to read
 * @param {string} section Optional. Name of section of configuration file to read
 * @returns {IApiSection} containing the configuration values
 */
var readIniConfig = function (fileName, section) {
    // get environment variables
    var config = readEnvConfig();
    if (fileName && fs.existsSync(fileName)) {
        // override any config file settings with environment values if the environment value is set
        config = __assign(__assign({}, exports.ApiConfigSection(fs.readFileSync(fileName, constants_1.utf8), section)), config);
    }
    // Unquote any quoted configuration values
    Object.keys(config).forEach(function (key) {
        var val = config[key];
        if (typeof val === 'string') {
            config[key] = constants_1.unquote(val);
        }
    });
    return config;
};
/**
 * Read configuration settings from Node environment variables
 *
 * This class initializes SDK settings **only** from the values passed in to its constructor and
 * (potentially) configured environment variables, and does not read a configuration file at all
 *
 * Any environment variables that **are** set, will override the values passed in to the constructor
 * with the same key
 *
 */
var NodeSettings = /** @class */ (function (_super) {
    __extends(NodeSettings, _super);
    function NodeSettings(contents, section) {
        var _this = this;
        var settings;
        if (contents) {
            if (typeof contents === 'string') {
                settings = exports.ApiConfigSection(contents, section);
            }
            else {
                settings = contents;
            }
            settings = __assign(__assign({}, readEnvConfig()), settings);
        }
        else {
            settings = readEnvConfig();
        }
        _this = _super.call(this, __assign(__assign({}, apiSettings_1.DefaultSettings()), settings)) || this;
        return _this;
    }
    // @ts-ignore
    NodeSettings.prototype.readConfig = function (section) {
        return readEnvConfig();
    };
    return NodeSettings;
}(apiSettings_1.ApiSettings));
exports.NodeSettings = NodeSettings;
/**
 * Example class that reads a configuration from a file in node
 *
 * If `fileName` is not specified in the constructor, the default file name is `./looker.ini`
 *
 * **Warning**: `.ini` files storing credentials should be secured in the run-time environment, and
 * ignored by version control systems so credentials never get checked in to source code repositories.
 * A recommended pattern is using Node environment variables to specify confidential API credentials
 * while using an `.ini` file for values like `base_url`.
 *
 * **Note**: If the configuration file is specified but does **not** exist, an error will be thrown.
 * No error is thrown if the fileName defaulted to `./looker.ini` inside the constructor and that
 * file does not exist. In that case, configuration from environment variables will be required.
 *
 */
var NodeSettingsIniFile = /** @class */ (function (_super) {
    __extends(NodeSettingsIniFile, _super);
    function NodeSettingsIniFile(fileName, section) {
        if (fileName === void 0) { fileName = ''; }
        var _this = this;
        if (fileName && !fs.existsSync(fileName)) {
            throw transport_1.sdkError({ message: "File " + fileName + " was not found" });
        }
        // default fileName to looker.ini
        fileName = fileName || './looker.ini';
        var settings = apiSettings_1.ValueSettings(readIniConfig(fileName, section));
        _this = _super.call(this, settings, section) || this;
        _this.fileName = fileName;
        return _this;
    }
    /**
     * Read a configuration section and return it as a generic keyed collection
     * If the configuration file doesn't exist, environment variables will be used for the values
     * Environment variables, if set, also override the configuration file values
     * @param section {string} Name of Ini section to read. Optional. Defaults to first section.
     *
     */
    NodeSettingsIniFile.prototype.readConfig = function (section) {
        return readIniConfig(this.fileName, section);
    };
    return NodeSettingsIniFile;
}(NodeSettings));
exports.NodeSettingsIniFile = NodeSettingsIniFile;
