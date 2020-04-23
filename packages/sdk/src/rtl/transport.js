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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore  complaints about rootDir violations for some build options
var constants_1 = require("./constants");
exports.agentPrefix = 'TS-SDK';
exports.LookerAppId = 'x-looker-appid';
/**
 * Set to `true` to follow streaming process
 */
var tracing = false;
/**
 * trivial tracing function that should be replaced with a log plugin
 * @param message description for trace
 * @param info any additional information to produce for output
 */
function trace(message, info) {
    if (tracing) {
        console.debug(message);
        if (info) {
            console.debug({ info: info });
        }
    }
}
exports.trace = trace;
/**
 * ResponseMode for an HTTP request - either binary or "string"
 */
var ResponseMode;
(function (ResponseMode) {
    ResponseMode[ResponseMode["binary"] = 0] = "binary";
    ResponseMode[ResponseMode["string"] = 1] = "string";
    ResponseMode[ResponseMode["unknown"] = 2] = "unknown"; // unrecognized response type
})(ResponseMode = exports.ResponseMode || (exports.ResponseMode = {}));
/**
 * MIME patterns for string content types
 * @type {RegExp}
 */
exports.contentPatternString = new RegExp(constants_1.matchModeString, "i");
/**
 * MIME patterns for "binary" content types
 * @type {RegExp}
 */
exports.contentPatternBinary = new RegExp(constants_1.matchModeBinary, "i");
/**
 * MIME pattern for UTF8 charset attribute
 * @type {RegExp}
 */
exports.charsetUtf8Pattern = new RegExp(constants_1.matchCharsetUtf8, "i");
/**
 * Default request timeout
 * @type {number} default request timeout is 120 seconds, or two minutes
 */
exports.defaultTimeout = 120;
/**
 * HTTP status codes
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status for reference
 * TODO is there a platform-agnostic list of these that can be used instead of this static declaration?
 */
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["Created"] = 201] = "Created";
    StatusCode[StatusCode["Accepted"] = 202] = "Accepted";
    StatusCode[StatusCode["NonAuthoritative"] = 203] = "NonAuthoritative";
    StatusCode[StatusCode["NoContent"] = 204] = "NoContent";
    StatusCode[StatusCode["ResetContent"] = 205] = "ResetContent";
    StatusCode[StatusCode["PartialContent"] = 206] = "PartialContent";
    StatusCode[StatusCode["MultiStatus"] = 207] = "MultiStatus";
    StatusCode[StatusCode["MultiStatusDav"] = 208] = "MultiStatusDav";
    StatusCode[StatusCode["IMUsed"] = 226] = "IMUsed";
    StatusCode[StatusCode["MultipleChoice"] = 300] = "MultipleChoice";
    StatusCode[StatusCode["MovedPermanently"] = 301] = "MovedPermanently";
    StatusCode[StatusCode["Found"] = 302] = "Found";
    StatusCode[StatusCode["SeeOther"] = 303] = "SeeOther";
    StatusCode[StatusCode["NotModified"] = 304] = "NotModified";
    StatusCode[StatusCode["UseProxy"] = 305] = "UseProxy";
    StatusCode[StatusCode["UnusedRedirect"] = 306] = "UnusedRedirect";
    StatusCode[StatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    StatusCode[StatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    StatusCode[StatusCode["Unauthorized"] = 401] = "Unauthorized";
    StatusCode[StatusCode["PaymentRequired"] = 402] = "PaymentRequired";
    StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    StatusCode[StatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    StatusCode[StatusCode["NotAcceptable"] = 406] = "NotAcceptable";
    StatusCode[StatusCode["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    StatusCode[StatusCode["RequestTimeout"] = 408] = "RequestTimeout";
    StatusCode[StatusCode["Conflict"] = 409] = "Conflict";
    StatusCode[StatusCode["Gone"] = 410] = "Gone";
    StatusCode[StatusCode["LengthRequired"] = 411] = "LengthRequired";
    StatusCode[StatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
    StatusCode[StatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
    StatusCode[StatusCode["UriTooLong"] = 414] = "UriTooLong";
    StatusCode[StatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    StatusCode[StatusCode["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    StatusCode[StatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
    StatusCode[StatusCode["ImATeapot"] = 418] = "ImATeapot";
    StatusCode[StatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    StatusCode[StatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    StatusCode[StatusCode["Locked"] = 423] = "Locked";
    StatusCode[StatusCode["FailedDependency"] = 424] = "FailedDependency";
    StatusCode[StatusCode["TooEarly"] = 425] = "TooEarly";
    StatusCode[StatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
    StatusCode[StatusCode["PreconditionRequired"] = 427] = "PreconditionRequired";
    StatusCode[StatusCode["TooManyRequests"] = 428] = "TooManyRequests";
    StatusCode[StatusCode["RequestHeaderFieldsTooLarge"] = 429] = "RequestHeaderFieldsTooLarge";
    StatusCode[StatusCode["UnavailableForLegalReasons"] = 430] = "UnavailableForLegalReasons";
    StatusCode[StatusCode["InternalServerError"] = 500] = "InternalServerError";
    StatusCode[StatusCode["NotImplemented"] = 501] = "NotImplemented";
    StatusCode[StatusCode["BadGateway"] = 502] = "BadGateway";
    StatusCode[StatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    StatusCode[StatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
    StatusCode[StatusCode["HttpVersionNotSupported"] = 505] = "HttpVersionNotSupported";
    StatusCode[StatusCode["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    StatusCode[StatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
    StatusCode[StatusCode["LoopDetected"] = 508] = "LoopDetected";
    StatusCode[StatusCode["NotExtended"] = 510] = "NotExtended";
    StatusCode[StatusCode["NetworkAuthRequired"] = 511] = "NetworkAuthRequired";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
/**
 * Is the content type binary or "string"?
 * @param {string} contentType
 * @returns {ResponseMode.binary | ResponseMode.string}
 */
function responseMode(contentType) {
    if (contentType.match(exports.contentPatternString)) {
        return ResponseMode.string;
    }
    if (contentType.match(exports.contentPatternBinary)) {
        return ResponseMode.binary;
    }
    return ResponseMode.unknown;
}
exports.responseMode = responseMode;
/**
 * Does this content type have a UTF-8 charset?
 * @param contentType
 * @returns match if it exists
 */
function isUtf8(contentType) {
    return contentType.match(/;.*\bcharset\b=\butf-8\b/i);
}
exports.isUtf8 = isUtf8;
/**
 * Encode parameter if not already encoded
 * @param value value of parameter
 * @returns URI encoded value
 */
function encodeParam(value) {
    if (value instanceof Date) {
        value = value.toISOString();
    }
    var encoded = value.toString();
    // decodeURIComponent throws URIError if there is a % character
    // without it being part of an encoded
    try {
        var decoded = decodeURIComponent(value);
        if (value === decoded) {
            encoded = encodeURIComponent(value);
        }
    }
    catch (e) {
        if (e instanceof URIError) {
            encoded = encodeURIComponent(value);
        }
        else {
            throw e;
        }
    }
    return encoded;
}
exports.encodeParam = encodeParam;
/**
 * Converts `Values` to query string parameter format
 * @param values Name/value collection to encode
 * @returns {string} query string parameter formatted values. Both `false` and `null` are included. Only `undefined` are omitted.
 */
function encodeParams(values) {
    if (!values)
        return "";
    var keys = Object.keys(values);
    var params = keys
        .filter(function (k) { return values[k] !== undefined; }) // `null` and `false` will both be passe
        .map(function (k) { return k + '=' + encodeParam(values[k]); })
        .join('&');
    return params;
}
exports.encodeParams = encodeParams;
/**
 * constructs the path argument including any optional query parameters
 * @param path the base path of the request
 * @param obj optional collection of query parameters to encode and append to the path
 */
function addQueryParams(path, obj) {
    if (!obj) {
        return path;
    }
    var qp = encodeParams(obj);
    return "" + path + (qp ? '?' + qp : '');
}
exports.addQueryParams = addQueryParams;
/**
 * SDK error handler
 * @param result any kind of error
 * @returns a new `Error` object with the failure message
 */
function sdkError(result) {
    if ('message' in result && typeof result.message === 'string') {
        return new Error(result.message);
    }
    if ('error' in result && 'message' in result.error && typeof result.error.message === 'string') {
        return new Error(result.error.message);
    }
    var error = JSON.stringify(result);
    return new Error("Unknown error with SDK method " + error);
}
exports.sdkError = sdkError;
/** A helper method for simplifying error handling of SDK responses.
 *
 * Pass in a promise returned by any SDK method, and it will return a promise
 * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
 * information in the error case, but allows you to route all the error cases
 * into a single promise rejection.
 *
 * The promise will have an `Error` rejection reason with a string `message`.
 * If the server error contains a `message` field, it will be provided, otherwise a
 * generic message will occur.
 *
 * ```ts
 * const sdk = LookerSDK({...})
 * let look
 * try {
 *    look = await sdkOk(sdk.create_look({...}))
 *    // do something with look
 * }
 * catch(e) {
 *    // handle error case
 * }
 * ```
 */
function sdkOk(promise) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promise];
                case 1:
                    result = _a.sent();
                    if (result.ok) {
                        return [2 /*return*/, result.value];
                    }
                    else {
                        throw sdkError(result);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.sdkOk = sdkOk;
