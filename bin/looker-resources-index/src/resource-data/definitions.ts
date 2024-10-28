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
import type { LocaleString } from '../types';
import { ContentType } from '../types';

export const contentType: Record<string, LocaleString> = {
  [ContentType.demo]:
    'Demo content demonstrates a use case and/or business value without the need for coding, configuration, or installation.',
  [ContentType.sandbox]:
    'Sandbox content allows interactive testing, coding, and simulation, without the need for setup or installation.',
  [ContentType.sampleCode]:
    'Sample code refers to illustrative code, usually simplified, that is representative of code that would be written by an application or service that integrates with one of our platform features.',
  [ContentType.sourceCode]:
    'Source code refers to the underlying code that defines our integrations. It is available for our open-source platform features, such as the Action API. It can often play a similar role to reference material, and can be much more complex than sample code.',
  [ContentType.library]:
    'Code that can be consumed as a dependency of other code, usually via a package/module manager',
  [ContentType.installableCode]:
    'Installable code is template or sample code that can also be directly deployed and then modified, often through existing automation such as the Looker Marketplace, without the need to first adapt it.',
};
