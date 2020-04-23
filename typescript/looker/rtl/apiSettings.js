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
var transport_1 = require("./transport");
var constants_1 = require("./constants");
exports.strLookerBaseUrl = constants_1.environmentPrefix + "_BASE_URL";
exports.strLookerVerifySsl = constants_1.environmentPrefix + "_VERIFY_SSL";
exports.strLookerTimeout = constants_1.environmentPrefix + "_TIMEOUT";
exports.strLookerClientId = constants_1.environmentPrefix + "_CLIENT_ID";
exports.strLookerClientSecret = constants_1.environmentPrefix + "_CLIENT_SECRET";
exports.ApiConfigMap = {
    'base_url': exports.strLookerBaseUrl,
    'verify_ssl': exports.strLookerVerifySsl,
    'timeout': exports.strLookerTimeout,
    'client_id': exports.strLookerClientId,
    'client_secret': exports.strLookerClientSecret
};
exports.strBadConfiguration = transport_1.agentPrefix + " configuration error:\nMissing required configuration values like base_url\n";
/**
 * default the runtime configuration settings
 * @constructor
 *
 */
exports.DefaultSettings = function () {
    return ({
        base_url: '',
        verify_ssl: true,
        timeout: transport_1.defaultTimeout,
        agentTag: transport_1.agentPrefix + " " + constants_1.lookerVersion,
    });
};
/**
 * Return environment variable name value first, otherwise config name value
 * @param {IValueSettings} values
 * @param {string} name
 * @returns {string}
 */
exports.configValue = function (values, name) {
    var val = values[exports.ApiConfigMap[name]] || values[name];
    return typeof val === 'string' ? constants_1.unquote(val) : val;
};
/**
 * Read any key/value collection for environment variable names and return as IApiSettings
 * @constructor
 *
 * The keys for the values are:
 *  - <environmentPrefix>_BASE_URL or `base_url`
 *  - <environmentPrefix>_CLIENT_ID or `client_id`
 *  - <environmentPrefix>_CLIENT_SECRET or `client_secret`
 *  - <environmentPrefix>_VERIFY_SSL or `verify_ssl`
 *  - <environmentPrefix>_TIMEOUT or `timeout`
 */
exports.ValueSettings = function (values) {
    var settings = exports.DefaultSettings();
    settings.base_url = exports.configValue(values, 'base_url') || settings.base_url;
    settings.verify_ssl = constants_1.boolDefault(exports.configValue(values, 'verify_ssl'), true);
    settings.agentTag = transport_1.agentPrefix + " " + constants_1.lookerVersion;
    var timeout = exports.configValue(values, 'timeout');
    settings.timeout = timeout ? parseInt(timeout, 10) : transport_1.defaultTimeout;
    return settings;
};
/**
 * @class ApiSettings
 *
 * .ini Configuration initializer
 */
var ApiSettings = /** @class */ (function () {
    function ApiSettings(settings) {
        // tslint:disable-next-line: variable-name
        this.base_url = '';
        // tslint:disable-next-line: variable-name
        this.verify_ssl = true;
        this.timeout = transport_1.defaultTimeout;
        this.agentTag = transport_1.agentPrefix + " " + constants_1.lookerVersion;
        // coerce types to declared types since some paths could have non-conforming settings values
        this.base_url = 'base_url' in settings ? constants_1.unquote(settings.base_url) : this.base_url;
        this.verify_ssl =
            'verify_ssl' in settings
                ? constants_1.isTrue(constants_1.unquote(settings.verify_ssl.toString()))
                : this.verify_ssl;
        this.timeout =
            'timeout' in settings
                ? parseInt(constants_1.unquote(settings.timeout.toString()), 10)
                : this.timeout;
        if (!this.isConfigured()) {
            throw new Error(exports.strBadConfiguration);
        }
    }
    ApiSettings.prototype.isConfigured = function () {
        return !!(this.base_url);
    };
    /**
     * Default dynamic configuration reader
     * @param section key/name of configuration section to read
     * @returns an empty `IAPISection`
     */
    // @ts-ignore
    ApiSettings.prototype.readConfig = function (section) {
        return {};
    };
    return ApiSettings;
}());
exports.ApiSettings = ApiSettings;
