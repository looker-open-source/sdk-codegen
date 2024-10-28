/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

module.exports = {
  /*
  Example configuration file showing how to override CodeGenerator settings.

  NOTE: This file does not actually override any typescript generator values. It shows how they CAN be overridden.

  See https://github.com/lorenwest/node-config for node config documentation

  TL;DR extracted from https://github.com/lorenwest/node-config/wiki/Configuration-Files
  - Set the `NODE_CONFIG_DIR` environment variable to point to the folder containing your configuration file
  - Set the `NODE_ENV` environment variable if you want to use a configuration file with a base name other
    than `default` or `development`

  or, use NODE_CONFIG as described in https://github.com/lorenwest/node-config/wiki/Command-Line-Overrides

  Overrides must use the language name from `/packages/sdk-codegen/src/codeGenerators.ts` as the key

  Only top-level properties as implemented in the relevant code generator can be changed.
  See ICodegen for the standard list.

  See https://github.com/lorenwest/node-config/blob/master/test/config/default.js for advanced config file syntax

  The `typescript` section declared below is an example that uses exactly the same values as the default typescript
  generator to demonstrate how generation attributes can be overridden after the generator is initialized.

  getGenerator() in `../src/languages.ts` processes these configuration values

  */
  typescript: {
    /**
     * special case for TypeScript output path due to mono repository
     */
    codePath: './packages/',
    /**
     * special case for TypeScript output path due to mono repository
     */
    packagePath: 'sdk/src',
    /**
     * use this to customize the sdk subfolder
       sdkPath: `sdk`,
     */
  },
};
