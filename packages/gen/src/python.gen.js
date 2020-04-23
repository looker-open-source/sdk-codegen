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
Object.defineProperty(exports, "__esModule", { value: true });
// Python codeFormatter
var sdkModels_1 = require("./sdkModels");
var codeGen_1 = require("./codeGen");
var PythonGen = /** @class */ (function (_super) {
    __extends(PythonGen, _super);
    function PythonGen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.methodInputModelTypes = new Set();
        _this.codePath = './python/';
        _this.packagePath = 'looker_sdk';
        _this.itself = 'self';
        _this.fileExtension = '.py';
        _this.commentStr = '# ';
        _this.nullStr = 'None';
        _this.indentStr = '    ';
        _this.argDelimiter = ",\n" + _this.indentStr.repeat(3);
        _this.paramDelimiter = ',\n';
        _this.propDelimiter = '\n';
        _this.dataStructureDelimiter = ', ';
        _this.endTypeStr = '';
        // keyword.kwlist
        _this.pythonKeywords = [
            'False',
            'None',
            'True',
            'and',
            'as',
            'assert',
            'async',
            'await',
            'break',
            'class',
            'continue',
            'def',
            'del',
            'elif',
            'else',
            'except',
            'finally',
            'for',
            'from',
            'global',
            'if',
            'import',
            'in',
            'is',
            'lambda',
            'nonlocal',
            'not',
            'or',
            'pass',
            'raise',
            'return',
            'try',
            'while',
            'with',
            'yield'
        ];
        _this.pythonTypes = {
            'number': { name: 'float', default: _this.nullStr },
            'double': { name: 'float', default: _this.nullStr },
            'float': { name: 'float', default: _this.nullStr },
            'integer': { name: 'int', default: _this.nullStr },
            'int32': { name: 'int', default: _this.nullStr },
            'int64': { name: 'int', default: _this.nullStr },
            'string': { name: 'str', default: _this.nullStr },
            'password': { name: 'str', default: _this.nullStr },
            'byte': { name: 'bytes', default: _this.nullStr },
            'boolean': { name: 'bool', default: _this.nullStr },
            'void': { name: 'None', default: _this.nullStr },
            'uri': { name: 'str', default: _this.nullStr },
            'datetime': { name: 'datetime.datetime', default: _this.nullStr }
        };
        // cattrs [un]structure hooks for model [de]serialization
        _this.hooks = [];
        _this.structureHook = 'structure_hook';
        _this.pythonReservedKeywordClasses = new Set();
        // @ts-ignore
        _this.methodsPrologue = function (indent) { return "\n# " + _this.warnEditing() + "\nimport datetime\nfrom typing import MutableMapping, Optional, Sequence, Union\n\nfrom . import models\nfrom " + _this.packagePath + ".rtl import api_methods\nfrom " + _this.packagePath + ".rtl import transport\n\nclass " + _this.packageName + "(api_methods.APIMethods):\n"; };
        // @ts-ignore
        _this.methodsEpilogue = function (indent) { return _this.apiVersion === '3.1' ? "LookerSDK = " + _this.packageName : ''; };
        // @ts-ignore
        _this.modelsPrologue = function (indent) { return "\n# " + _this.warnEditing() + "\nimport datetime\nfrom typing import MutableMapping, Optional, Sequence\n\nimport attr\n\nfrom " + _this.packagePath + ".rtl import model\nfrom " + _this.packagePath + ".rtl import serialize as sr\n\nEXPLICIT_NULL = model.EXPLICIT_NULL  # type: ignore\nDelimSequence = model.DelimSequence\n"; };
        // @ts-ignore
        _this.modelsEpilogue = function (indent) { return "\n\n# The following cattrs structure hook registrations are a workaround\n# for https://github.com/Tinche/cattrs/pull/42 Once this issue is resolved\n# these calls will be removed.\n\nimport functools  # noqa:E402\nfrom typing import ForwardRef  # type: ignore  # noqa:E402\n\n" + _this.structureHook + " = functools.partial(sr.structure_hook, globals(), sr.converter" + _this.apiRef + ")\n" + _this.hooks.join('\n') + "\n"; };
        return _this;
    }
    PythonGen.prototype.sdkFileName = function (baseFileName) {
        return this.fileName("sdk/api" + this.apiRef + "/" + baseFileName);
    };
    // @ts-ignore
    PythonGen.prototype.argGroup = function (indent, args) {
        if ((!args) || args.length === 0)
            return this.nullStr;
        var hash = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            hash.push("\"" + arg + "\": " + arg);
        }
        return "{" + hash.join(this.dataStructureDelimiter) + "}";
    };
    // @ts-ignore
    PythonGen.prototype.createRequester = function (indent, method) {
        return '';
    };
    // @ts-ignore
    PythonGen.prototype.argList = function (indent, args) {
        return args && args.length !== 0
            ? "\n" + indent + args.join(this.argDelimiter)
            : this.nullStr;
    };
    PythonGen.prototype.declareProperty = function (indent, property) {
        var mappedType = this.typeMapModels(property.type);
        var propName = property.name;
        if (this.pythonKeywords.includes(propName)) {
            propName = propName + '_';
        }
        var propType = mappedType.name;
        if (!property.required) {
            propType = "Optional[" + mappedType.name + "] = " + this.nullStr;
        }
        var propDef = "" + indent + propName + ": " + propType;
        return propDef;
    };
    PythonGen.prototype.methodReturnType = function (method) {
        var type = this.typeMapMethods(method.type);
        var returnType = type.name;
        if (method.responseIsBoth()) {
            returnType = "Union[" + returnType + ", bytes]";
        }
        else if (method.responseIsBinary()) {
            returnType = 'bytes';
        }
        return returnType;
    };
    // because Python has named default parameters, Request types are not required like
    // they are for Typescript
    PythonGen.prototype.methodSignature = function (indent, method) {
        var _this = this;
        var _a;
        var returnType = this.methodReturnType(method);
        var bump = this.bumper(indent);
        var params = [];
        var args = method.allParams;
        if (args && args.length > 0) {
            method.allParams.forEach(function (p) { return params.push(_this.declareParameter(bump, p)); });
        }
        var head = (_a = method.description) === null || _a === void 0 ? void 0 : _a.trim();
        head = (head ? head + "\n\n" : '') + (method.httpMethod + " " + method.endpoint + " -> " + returnType);
        params.push(bump + "transport_options: Optional[transport.PTransportSettings] = None,");
        return this.commentHeader(indent, head)
            + (indent + "def " + method.name + "(\n")
            + (bump + "self" + (params.length > 0 ? ',\n' : ''))
            + (params.join(this.paramDelimiter) + "\n")
            + (indent + ") -> " + returnType + ":\n");
    };
    PythonGen.prototype.addMethodInputModelType = function (type) {
        this.methodInputModelTypes.add(type);
        for (var _i = 0, _a = Object.values(type.properties); _i < _a.length; _i++) {
            var prop = _a[_i];
            if (prop.type.elementType) {
                this.addMethodInputModelType(prop.type.elementType);
            }
        }
    };
    PythonGen.prototype.declareParameter = function (indent, param) {
        var type;
        if (param.location === sdkModels_1.strBody) {
            type = this.writeableType(param.type) || param.type;
            this.addMethodInputModelType(type);
        }
        else {
            type = param.type;
        }
        var mapped = this.typeMapMethods(type);
        var paramType = (param.required ? mapped.name : "Optional[" + mapped.name + "]");
        return this.commentHeader(indent, param.description)
            + ("" + indent + param.name + ": " + paramType)
            + (param.required ? '' : " = " + mapped.default);
    };
    PythonGen.prototype.initArg = function (indent, property) {
        return indent + "self." + property.name + " = " + property.name;
    };
    /**
     * Ideally we'd rely on @attr.s to generate the constructor for us
     * However, neither Jedi (https://github.com/davidhalter/jedi-vim/issues/816)
     * nor microsoft/python-language-server
     * (https://github.com/microsoft/python-language-server/issues/399)
     * display good tooltips for these auto-generated __init__ methods. So for
     * now we'll generate them ourselves following the functionality of
     * @attr.s(kw_only=True) we'll only allow kw_args.
     */
    PythonGen.prototype.construct = function (indent, type) {
        var _this = this;
        // Skip read-only parameters
        if (!this.methodInputModelTypes.has(type))
            return '';
        indent = this.bumper(indent);
        var bump = this.bumper(indent);
        var result = "\n\n" + indent + "def __init__(self, *" + this.argDelimiter;
        var args = [];
        var inits = [];
        Object.values(type.properties)
            .forEach(function (prop) {
            args.push(_this.declareConstructorArg('', prop));
            inits.push(_this.initArg(bump, prop));
        });
        result += args.join(this.argDelimiter) + "):\n"
            + inits.join('\n');
        return result;
    };
    PythonGen.prototype.declareConstructorArg = function (indent, property) {
        var mappedType = this.typeMapModels(property.type);
        var propType;
        if (property.required) {
            propType = mappedType.name;
        }
        else {
            propType = "Optional[" + mappedType.name + "] = " + this.nullStr;
        }
        return "" + indent + property.name + ": " + propType;
    };
    // this is a builder function to produce arguments with optional null place holders but no extra required optional arguments
    PythonGen.prototype.argFill = function (current, args) {
        if ((!current) && args.trim() === this.nullStr) {
            // Don't append trailing optional arguments if none have been set yet
            return '';
        }
        var delimiter = this.argDelimiter;
        if (!current) {
            delimiter = '';
            // Caller manually inserted delimiter followed by inline comment
        }
        else if (args.match(/, {2}#/)) {
            delimiter = this.argDelimiter.replace(',', '');
        }
        return "" + args + delimiter + current;
    };
    PythonGen.prototype.httpArgs = function (indent, method) {
        var result = this.argFill('', this.argGroup(indent, method.cookieArgs));
        result = this.argFill(result, this.argGroup(indent, method.headerArgs));
        result = this.argFill(result, "transport_options=transport_options");
        if (method.bodyArg) {
            result = this.argFill(result, "body=" + method.bodyArg);
        }
        if (method.queryArgs.length) {
            var queryParams = this.argGroup(indent, method.queryArgs);
            result = this.argFill(result, "query_params=" + queryParams);
        }
        var type = this.typeMapMethods(method.type);
        var returnType = this.methodReturnType(method);
        if (returnType === "Union[" + type.name + ", bytes]") {
            returnType = returnType + ",  # type: ignore";
        }
        result = this.argFill(result, returnType);
        result = this.argFill(result, "f\"" + method.endpoint + "\"");
        return result;
    };
    PythonGen.prototype.httpCall = function (indent, method) {
        var bump = indent + this.indentStr;
        var args = this.httpArgs(bump, method);
        var methodCall = indent + "response = " + this.it(method.httpMethod.toLowerCase());
        var assertTypeName = this.methodReturnType(method);
        if (method.type instanceof sdkModels_1.ArrayType) {
            assertTypeName = 'list';
        }
        else if (method.type instanceof sdkModels_1.HashType) {
            assertTypeName = 'dict';
        }
        else if (assertTypeName === 'Union[str, bytes]') {
            assertTypeName = '(str, bytes)';
        }
        var assertion = indent + "assert ";
        if (assertTypeName === this.nullStr) {
            assertion += "response is " + this.nullStr;
        }
        else {
            assertion += "isinstance(response, " + assertTypeName + ")";
        }
        var returnStmt = indent + "return response";
        return methodCall + "(\n"
            + ("" + bump.repeat(3) + args + "\n")
            + (indent + ")\n")
            + (assertion + "\n")
            + ("" + returnStmt);
    };
    PythonGen.prototype.encodePathParams = function (indent, method) {
        // const bump = indent + this.indentStr
        var encodings = '';
        var pathParams = method.pathParams;
        if (pathParams.length > 0) {
            for (var _i = 0, pathParams_1 = pathParams; _i < pathParams_1.length; _i++) {
                var param = pathParams_1[_i];
                if (param.doEncode()) {
                    encodings += "" + indent + param.name + " = self.encode_path_param(" + param.name + ")\n";
                }
            }
        }
        return encodings;
    };
    PythonGen.prototype.bodyParamsTypeAssertions = function (indent, bodyParams) {
        var bump = indent + this.indentStr;
        var assertions = '';
        if (bodyParams.length > 0) {
            for (var _i = 0, bodyParams_1 = bodyParams; _i < bodyParams_1.length; _i++) {
                var param = bodyParams_1[_i];
                if (param.location === sdkModels_1.strBody) {
                    var conditionStr = param.required ? '' : indent + "if " + param.name + ":\n" + bump;
                    var type = this.writeableType(param.type) || param.type;
                    var bodyType = this.typeMapMethods(type).name;
                    if (bodyType.startsWith('Sequence')) {
                        bodyType = 'Sequence';
                    }
                    else if (bodyType.startsWith('MutableMapping')) {
                        bodyType = 'MutableMapping';
                    }
                    else if (bodyType.startsWith('models.DelimSequence')) {
                        bodyType = 'models.DelimSequence';
                    }
                    assertions += ("" + conditionStr + indent + "assert isinstance(" + param.name + ", " + bodyType + ")\n");
                }
            }
        }
        return assertions;
    };
    PythonGen.prototype.declareMethod = function (indent, method) {
        var bump = this.bumper(indent);
        // APIMethods/AuthSession handle auth
        if (method.name === 'login') {
            return indent + "# login() using api3credentials is automated in the client";
        }
        else if (method.name === 'login_user') {
            return indent + "def login_user(self, user_id: int) -> api_methods.APIMethods:\n" + bump + "return super().login_user(user_id)";
        }
        else if (method.name === 'logout') {
            return indent + "def logout(self) -> None:\n" + bump + "super().logout()";
        }
        return this.methodSignature(indent, method)
            + this.summary(bump, method.summary)
            + this.encodePathParams(bump, method)
            + this.bodyParamsTypeAssertions(bump, method.bodyParams)
            + this.httpCall(bump, method);
    };
    PythonGen.prototype.typeSignature = function (indent, type) {
        var bump = this.bumper(indent);
        var b2 = this.bumper(bump);
        var attrs = [];
        var usesReservedPythonKeyword = false;
        for (var _i = 0, _a = Object.values(type.properties); _i < _a.length; _i++) {
            var prop = _a[_i];
            var propName = prop.name;
            if (this.pythonKeywords.includes(propName)) {
                propName = propName + '_';
                usesReservedPythonKeyword = true;
            }
            var attr = "" + b2 + propName + ":";
            if (prop.description) {
                attr += " " + prop.description;
            }
            attrs.push(attr);
        }
        var attrsArgs = 'auto_attribs=True, kw_only=True';
        if (this.methodInputModelTypes.has(type)) {
            attrsArgs += ', init=False';
        }
        var forwardRef = "ForwardRef(\"" + type.name + "\")";
        this.hooks.push("sr.converter" + this.apiRef + ".register_structure_hook(\n" + bump + forwardRef + ",  # type: ignore\n" + bump + this.structureHook + "  # type:ignore\n)");
        if (usesReservedPythonKeyword) {
            this.hooks.push("sr.converter" + this.apiRef + ".register_structure_hook(\n" + bump + type.name + ",  # type: ignore\n" + bump + this.structureHook + "  # type:ignore\n)");
        }
        return "\n" +
            (indent + "@attr.s(" + attrsArgs + ")\n") +
            (indent + "class " + type.name + "(model.Model):\n") +
            (bump + "\"\"\"\n") +
            (type.description ? "" + bump + type.description + "\n\n" : '') +
            (bump + "Attributes:\n") +
            (attrs.join('\n') + "\n") +
            (bump + "\"\"\"\n");
    };
    PythonGen.prototype.summary = function (indent, text) {
        return text ? indent + "\"\"\"" + text + "\"\"\"\n" : '';
    };
    PythonGen.prototype._typeMap = function (type, format) {
        _super.prototype.typeMap.call(this, type);
        if (type.elementType) {
            var map = this._typeMap(type.elementType, format);
            if (type instanceof sdkModels_1.ArrayType) {
                return { name: "Sequence[" + map.name + "]", default: this.nullStr };
            }
            else if (type instanceof sdkModels_1.HashType) {
                return { name: "MutableMapping[str, " + map.name + "]", default: this.nullStr };
            }
            else if (type instanceof sdkModels_1.DelimArrayType) {
                return { name: "models.DelimSequence[" + map.name + "]", default: this.nullStr };
            }
            throw new Error("Don't know how to handle: " + JSON.stringify(type));
        }
        if (type.name) {
            var name_1;
            if (format === 'models') {
                name_1 = "\"" + type.name + "\"";
            }
            else if (format === 'methods') {
                name_1 = "models." + type.name;
            }
            else {
                throw new Error('format must be "models" or "methods"');
            }
            return this.pythonTypes[type.name] || { name: name_1, default: this.nullStr };
        }
        else {
            throw new Error('Cannot output a nameless type.');
        }
    };
    PythonGen.prototype.typeMapMethods = function (type) {
        return this._typeMap(type, 'methods');
    };
    PythonGen.prototype.typeMapModels = function (type) {
        return this._typeMap(type, 'models');
    };
    return PythonGen;
}(codeGen_1.CodeGen));
exports.PythonGen = PythonGen;
