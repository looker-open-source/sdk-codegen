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

export interface Resource {
  id: ResourceId;
  title: LocaleString;
  description: LocaleString;
  url: LocaleString;

  // Optional
  isGoogleResource?: boolean;
  isHackathonSpecific?: boolean;
  thumbnailImageUrl?: LocaleString;
  // publishDate
  // lastUpdate
  // authorNames
  // authorAvatars
  // some form of rating or quality metric?

  // Optional "tags"
  contentTypes?: ContentType[];
  platformFeatures?: PlatformFeature[];
  languages?: Language[];
  licenses?: License[];
  relatedResources?: ResourceId[];
  personas?: Persona[];
  tags?: string[];
}

export enum ContentType {
  article = 'article',
  tutorial = 'tutorial',
  course = 'course',
  workshop = 'workshop',
  demo = 'demo',
  sandbox = 'sandbox',
  tool = 'tool',
  library = 'library',
  reference = 'reference',
  sampleCode = 'sampleCode',
  sourceCode = 'sourceCode',
  template = 'template',
  installableCode = 'installableCode',
  data = 'data',
  video = 'video',
  other = 'other',
}

export enum PlatformFeature {
  actions = 'actions',
  api = 'api',
  components = 'components',
  embed = 'embed',
  extensions = 'extensions',
  git = 'git',
  lookml = 'lookml',
  oauth = 'oauth',
  sdk = 'sdk',
  customVisualization = 'customVisualization',
  other = 'other',
}

export enum Language {
  javascript = 'javascript',
  typescript = 'typescript',
  python = 'python',
  ruby = 'ruby',
  cSharp = 'cSharp',
  kotlin = 'kotlin',
  swift = 'swift',
  go = 'go',
  r = 'r',
  php = 'php',
  lookml = 'lookml',
  other = 'other',
}

export enum License {
  mit = 'mit',
  unlicensed = 'unlicensed',
  other = 'other',
  unknown = 'unknown',
}

export enum Persona {
  developer = 'developer',
  frontendDeveloper = 'developer/frontend',
  backendDeveloper = 'developer/backend',
  modeler = 'modeler',
  admin = 'admin',
  analyst = 'analyst',
  investigator = 'viewer',
  other = 'other',
}

export type ResourceId = string;
export type LocaleString = string | Record<string, string>;
