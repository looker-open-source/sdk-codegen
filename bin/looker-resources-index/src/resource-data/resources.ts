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
import type { Resource } from '../types';
import { ContentType, Language, Persona, PlatformFeature } from '../types';

// Common, unambiguous values for conciseness
const {
  tutorial,
  demo,
  sandbox,
  tool,
  library,
  sampleCode,
  reference,
  sourceCode,
  video,
} = ContentType;
const { javascript, typescript, python } = Language;
const {
  admin,
  developer,
  frontendDeveloper,
  backendDeveloper,
  modeler,
  analyst,
  investigator,
} = Persona;
const {
  actions,
  api,
  components,
  embed,
  extensions,
  git,
  customVisualization,
} = PlatformFeature;

export const resources: Resource[] = [
  {
    id: '//atomfashion.io',
    title: 'Embed Demo',
    description: "A comprehensive demo of Looker's embedding capabilities",
    url: 'https://atomfashion.io/',
    isGoogleResource: true,
    contentTypes: [demo],
    platformFeatures: [embed, api],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//community.looker.com/looker-api-77/creating-a-development-environment-for-custom-visualizations-8470',
    title: 'Custom Viz Dev Environment Setup',
    description: 'A tutorial to build a custom viz development environment',
    url: 'https://community.looker.com/looker-api-77/creating-a-development-environment-for-custom-visualizations-8470',
    contentTypes: [tutorial, sampleCode],
    platformFeatures: [customVisualization],
    languages: [typescript],
    personas: [developer, frontendDeveloper, analyst],
  },
  {
    id: '//community.looker.com/lookml-5/automating-frequently-changing-schemas-with-aws-lambda-10196',
    title: 'Automate Schema Changes',
    description:
      'Learn how to set up your Looker instance to poll and make changes to your LookML model with an AWS Lambda function.',
    url: 'https://community.looker.com/lookml-5/automating-frequently-changing-schemas-with-aws-lambda-10196',
    contentTypes: [tutorial, sampleCode],
    platformFeatures: [git, PlatformFeature.lookml],
    languages: [python],
    personas: [developer, backendDeveloper, modeler],
  },
  {
    id: '//community.looker.com/open-source-projects-78/export-the-results-of-a-looker-query-to-bigquery-9720',
    title: 'BigQuery Writeback Action',
    description:
      'Learn how to write an action that exports the results of a Looker Query to BigQuery.',
    url: 'https://community.looker.com/open-source-projects-78/export-the-results-of-a-looker-query-to-bigquery-9720',
    contentTypes: [tutorial, sampleCode],
    platformFeatures: [actions],
    languages: [python, Language.lookml],
    personas: [developer, backendDeveloper, analyst],
  },
  {
    id: '//components.looker.com',
    title: 'Looker Components',
    description:
      'Looker Components are a collection of tools for building Looker data experiences.',
    url: 'https://components.looker.com/',
    isGoogleResource: true,
    contentTypes: [reference],
    platformFeatures: [components],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//components.looker.com/storybook',
    title: 'Components Examples Storybook',
    description: 'Looker Components Storybook contains component examples',
    url: 'https://components.looker.com/storybook',
    isGoogleResource: true,
    contentTypes: [reference, demo, sandbox],
    platformFeatures: [components],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//covid19response.cloud.looker.com/embed/dashboards-next/51',
    title: 'COVID-19 Dashboards',
    description: 'Prebuilt dashboards for immediate access to COVID-19 data.',
    url: 'https://covid19response.cloud.looker.com/embed/dashboards-next/51',
    contentTypes: [demo],
    platformFeatures: [],
    personas: [modeler, analyst, investigator],
  },
  {
    id: '//developers.looker.com/components/visualization-components',
    title: 'Visualization Components Playground',
    description:
      "An interactive demonstration of Looker's new Visualization Components",
    url: 'https://developers.looker.com/components/visualization-components',
    contentTypes: [sandbox],
    platformFeatures: [components],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//fabio-looker.github.io/looker_sso_tool',
    title: 'SSO Embed Tool',
    description:
      'This tool helps you troubleshoot SSO embed URLs generated by your scripts.',
    url: 'https://fabio-looker.github.io/looker_sso_tool/',
    contentTypes: [tool, sandbox],
    platformFeatures: [embed],
    personas: [developer],
  },
  {
    id: '//github.com/brechtv/looker_google_sheets',
    title: 'Looker API for Google Sheets',
    description:
      'This Google Apps Script uses Looker API to load Looks, get data dictionaries, etc.',
    url: 'https://github.com/brechtv/looker_google_sheets',
    contentTypes: [sampleCode],
    platformFeatures: [api],
    languages: [javascript],
    personas: [developer, analyst],
  },
  {
    id: '//github.com/bryan-at-looker/looker-feed',
    title: 'Looker Feed Extension Mockup',
    description: 'An early-stage mockup of a Twitter-style Looker Extension.',
    url: 'https://github.com/bryan-at-looker/looker-feed',
    contentTypes: [sampleCode],
    platformFeatures: [extensions],
    languages: [typescript],
    personas: [developer],
  },
  {
    id: '//github.com/fabio-looker/eav-builder',
    title: 'EAV Builder',
    description: 'An automated EAV builder for EAV schemas.',
    url: 'https://github.com/fabio-looker/eav-builder',
    contentTypes: [tool],
    platformFeatures: [PlatformFeature.lookml],
    personas: [developer, modeler],
  },
  {
    id: '//github.com/fabio-looker/looker_sso_tool',
    title: 'SSO Embed Tool Source',
    description:
      'The source code for the SSO embed tool for you to extend or run locally.',
    url: 'https://github.com/fabio-looker/looker_sso_tool',
    contentTypes: [tool],
    platformFeatures: [embed],
    languages: [javascript],
    personas: [developer],
  },
  {
    id: '//github.com/fabio-looker/sample-cloud-function-action',
    title: 'Sample Action for Google Cloud Functions',
    description:
      'Sample code for an Action & ActionHub, for use on Google Cloud Functions (serverless)',
    url: 'https://github.com/fabio-looker/sample-cloud-function-action',
    contentTypes: [sampleCode],
    platformFeatures: [actions],
    languages: [javascript],
    personas: [developer, backendDeveloper],
  },
  {
    id: '//github.com/fishtown-analytics/dbtdocs-to-lookml',
    title: 'DBTdocs To LookML',
    description:
      'A tool to persist descriptions from your dbt project to your lookml project.',
    url: 'https://github.com/fishtown-analytics/dbtdocs-to-lookml',
    isGoogleResource: false,
    contentTypes: [tool],
    platformFeatures: [PlatformFeature.lookml],
    personas: [developer, modeler],
  },
  {
    id: '//github.com/Headset/looker-environment',
    title: 'Custom Vis Dev Environment Example',
    description:
      'An example custom viz development environment developed by Headset. (may be out of date)',
    url: 'https://github.com/Headset/looker-environment',
    isGoogleResource: false,
    contentTypes: [sampleCode],
    platformFeatures: [customVisualization],
    languages: [typescript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/joshtemple/lkml',
    title: 'LookML parser',
    description: 'A LookML parser and serializer implemented in Python.',
    url: 'https://github.com/joshtemple/lkml',
    isGoogleResource: false,
    contentTypes: [tool, library],
    platformFeatures: [PlatformFeature.lookml],
    languages: [python],
    personas: [developer, backendDeveloper, modeler],
  },
  {
    id: '//github.com/Ladvien/vscode-looker',
    title: 'LookML VSCode Syntax',
    description: 'VSCode syntax for LookML. (may be out of date)',
    url: 'https://github.com/Ladvien/vscode-looker',
    isGoogleResource: false,
    contentTypes: [tool],
    platformFeatures: [PlatformFeature.lookml],
    personas: [developer, modeler],
  },
  {
    id: '//github.com/leighajarett/JSON_to_LookML',
    title: 'JSON To LookML',
    description:
      'This script was designed for data tables with JSON objects. It creates a LookML view file with a dimension for each JSON object field. (may be out of date)',
    url: 'https://github.com/leighajarett/JSON_to_LookML',
    contentTypes: [tool],
    platformFeatures: [PlatformFeature.lookml],
    personas: [developer, modeler],
  },
  {
    id: '//github.com/looker-open-source/app-data-dictionary',
    title: 'Data Dictionary Extension',
    description:
      'This is the official Looker Data Dictionary, fully open source and available as an example.',
    url: 'https://github.com/looker-open-source/app-data-dictionary',
    isGoogleResource: true,
    contentTypes: [sampleCode],
    platformFeatures: [extensions],
    languages: [typescript],
    personas: [developer, modeler, analyst, investigator],
  },
  {
    id: '//github.com/looker-open-source/chatty',
    title: 'Chatty - Iframe Msg Manager',
    description:
      'Chatty is a simple web browser iframe host/client channel message manager. We use it for iframe communication.',
    url: 'https://github.com/looker-open-source/chatty',
    isGoogleResource: true,
    contentTypes: [library, sourceCode],
    platformFeatures: [embed],
    languages: [typescript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/looker-open-source/create-looker-extension',
    title: 'Extension Creation Utility',
    description:
      'Create extensions with zero manual configuration with the create-looker-extension utility.',
    url: 'https://github.com/looker-open-source/create-looker-extension',
    contentTypes: [tool, ContentType.template],
    platformFeatures: [extensions],
    languages: [typescript, javascript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/looker-open-source/embed-sdk',
    title: 'Embed SDK',
    description:
      'The Looker JavaScript Embed SDK makes embedding Looker content in your web application easy!',
    url: 'https://github.com/looker-open-source/embed-sdk',
    isGoogleResource: true,
    contentTypes: [library, sourceCode],
    platformFeatures: [embed],
    languages: [javascript, typescript],
    personas: [developer],
  },
  {
    id: '//github.com/looker-open-source/extension-examples',
    title: 'Extension Framework Examples',
    description:
      'A repository with multiple Extension Framework examples using Typescript, Javascript, React, and Redux',
    url: 'https://github.com/looker-open-source/extension-examples',
    isGoogleResource: true,
    contentTypes: [sampleCode],
    platformFeatures: [extensions],
    languages: [javascript, typescript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/looker-open-source/extension-examples/tree/main/react/typescript/access-key-demo',
    title: 'Extension Example: Access Key',
    description:
      'This example demonstrates how to write a Looker extension that needs an access key to run.',
    url: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/access-key-demo',
    isGoogleResource: true,
    contentTypes: [sampleCode],
    platformFeatures: [extensions],
    languages: [typescript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/looker-open-source/extension-examples/tree/main/react/typescript/kitchensink',
    title: 'Extension Example: Kitchensink',
    description:
      "This example demonstrates most of Extension SDK's functionality and is a great starting point.",
    url: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/kitchensink',
    isGoogleResource: true,
    contentTypes: [sampleCode],
    platformFeatures: [extensions],
    languages: [typescript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//github.com/looker-open-source/gzr',
    title: 'Gzr',
    description: 'Gzr is a Looker Content Utility developer tool',
    url: 'https://github.com/looker-open-source/gzr',
    isGoogleResource: true,
    contentTypes: [tool, sourceCode],
    platformFeatures: [api],
    languages: [Language.ruby],
    personas: [developer, backendDeveloper, admin],
  },
  {
    id: '//github.com/looker-open-source/healthcare_demo',
    title: 'Sample LookML: Healthcare',
    description:
      'A BigQuery-based LookML project that demonstrates Looker’s value in the healthcare landscape.',
    url: 'https://github.com/looker-open-source/healthcare_demo',
    contentTypes: [sampleCode],
    languages: [Language.lookml],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler],
  },
  {
    id: '//github.com/looker-open-source/henry',
    title: 'Henry',
    description:
      'Henry is a command line tool that finds model bloat in your Looker instance and identifies unused content in models and explores.',
    url: 'https://github.com/looker-open-source/henry',
    isGoogleResource: true,
    contentTypes: [tool, sourceCode],
    languages: [python],
    platformFeatures: [api, PlatformFeature.lookml],
    personas: [modeler, admin],
  },
  {
    id: '//github.com/looker-open-source/look-at-me-sideways',
    title: 'LookML Style Guide & Linter',
    description:
      'Look At Me Sideways (LAMS) is the official LookML style guide and linter to help you create maintainable LookML projects.',
    url: 'https://github.com/looker-open-source/look-at-me-sideways',
    isGoogleResource: true,
    contentTypes: [tool, sourceCode],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler, admin],
    languages: [javascript],
  },
  {
    id: '//github.com/looker-open-source/lookr',
    title: 'Looker R SDK 3.0',
    description: 'Looker 3.0 SDK for R',
    url: 'https://github.com/looker-open-source/lookr',
    contentTypes: [library, sourceCode],
    languages: [Language.r],
    platformFeatures: [api, PlatformFeature.sdk],
    personas: [developer],
  },
  {
    id: '//github.com/looker-open-source/marketing_demo',
    title: 'Sample LookML: Digital Marketing',
    description:
      'A Snowflake-based LookML project that demonstrates Looker’s value in the digital marketing landscape.',
    url: 'https://github.com/looker-open-source/marketing_demo',
    contentTypes: [sampleCode],
    languages: [Language.lookml],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler],
  },
  {
    id: '//github.com/looker-open-source/sdk-codegen',
    title: 'SDK Codegen',
    description:
      'The SDK Codegen is the source of truth for all SDKs and lets you create them for any language',
    url: 'https://github.com/looker-open-source/sdk-codegen',
    contentTypes: [library],
    platformFeatures: [api, PlatformFeature.sdk],
    languages: [
      Language.cSharp,
      Language.go,
      Language.kotlin,
      python,
      Language.r,
      Language.ruby,
      Language.swift,
      typescript,
    ],
    personas: [developer],
  },
  {
    id: '//github.com/looker-open-source/sdk-codegen/tree/main/examples',
    title: 'SDK Examples',
    description:
      'Our collection of SDK examples currently in: C#, Java, Kotlin, Python, R, Ruby, Swift, and TypeScript.',
    url: 'https://github.com/looker-open-source/sdk-codegen/tree/main/examples',
    contentTypes: [sampleCode],
    languages: [
      Language.cSharp,
      Language.go,
      Language.kotlin,
      python,
      Language.r,
      Language.ruby,
      Language.swift,
      typescript,
    ],
    platformFeatures: [api, PlatformFeature.sdk],
    personas: [developer],
  },
  {
    id: '//github.com/looker/actions',
    title: 'Action Hub Source',
    description:
      'The official Looker Action Hub repository for all your action requirements and examples.',
    url: 'https://github.com/looker/actions',
    contentTypes: [sourceCode, reference],
    platformFeatures: [actions],
    languages: [typescript],
    personas: [developer, backendDeveloper],
  },
  {
    id: '//github.com/looker/actions/tree/master/src/actions',
    title: 'Actions Source',
    description:
      'Direct link to the directory of all complete Actions in the official action hub.',
    url: 'https://github.com/looker/actions/tree/master/src/actions',
    contentTypes: [sourceCode, sampleCode],
    platformFeatures: [actions],
    languages: [typescript],
    personas: [developer, backendDeveloper],
  },
  {
    id: '//github.com/looker/covid19',
    title: 'COVID-19 Data Block',
    description:
      'This COVID-19 Block consists of LookML models, pre-built dashboards, and explores. The underlying data is only available in BigQuery.',
    url: 'https://github.com/looker/covid19',
    contentTypes: [sampleCode],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler],
    languages: [Language.lookml],
  },
  {
    id: '//github.com/looker/custom_visualizations_v2',
    title: 'Custom Visualizations v2',
    description:
      'The official repository of Looker Custom Visualizations API and examples',
    url: 'https://github.com/looker/custom_visualizations_v2',
    contentTypes: [reference, sampleCode],
    platformFeatures: [customVisualization],
    personas: [developer, Persona.frontendDeveloper],
    languages: [typescript],
  },
  {
    id: '//github.com/looker/looker_embed_sso_examples',
    title: 'Looker Embed SSO Examples',
    description:
      "Examples of performing Looker's SSO Embed URL signing in various server-side languages",
    url: 'https://github.com/looker/looker_embed_sso_examples',
    contentTypes: [sampleCode],
    platformFeatures: [embed],
    languages: [
      Language.cSharp,
      Language.go,
      javascript,
      Language.php,
      python,
      Language.ruby,
    ],
    personas: [developer, backendDeveloper],
  },
  {
    id: '//github.com/thalesmello/lkml.vim',
    title: 'LookML Vim Syntax',
    description: 'Vim syntax for LookML. (may be out of date)',
    url: 'https://github.com/thalesmello/lkml.vim',
    contentTypes: [tool],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler],
  },
  {
    id: '//github.com/ww-tech/lookml-tools',
    title: "WW's LookML Tools",
    description:
      'Developed by WW, this repository contains tools to handle best practices with developing LookML files.',
    url: 'https://github.com/ww-tech/lookml-tools',
    contentTypes: [tool, sampleCode],
    platformFeatures: [PlatformFeature.lookml],
    personas: [modeler],
    languages: [python],
  },
  {
    id: '//gitlab.com/alison985/awesome-looker',
    title: 'Awesome Looker Projects',
    description: 'An awesome list of awesome Looker projects.',
    url: 'https://gitlab.com/alison985/awesome-looker/-/tree/main',
    contentTypes: [ContentType.other],
    personas: [Persona.other],
  },
  {
    id: '//hack.looker.com/dashboards/16',
    title: 'BQ Public Datasets on hack.looker.com',
    description: 'BigQuery PublicHackathon',
    url: 'https://hack.looker.com/dashboards/16',
    isHackathonSpecific: true,
    contentTypes: [ContentType.data],
    personas: [modeler, analyst, investigator],
  },
  {
    id: '//hack.looker.com/extensions/marketplace_extension_api_explorer::api-explorer',
    title: 'API Explorer on hack.looker.com',
    description:
      'The API Explorer lets you learn and interact with the Looker API.',
    url: 'https://hack.looker.com/extensions/marketplace_extension_api_explorer::api-explorer',
    isHackathonSpecific: true,
    contentTypes: [tool],
    platformFeatures: [api],
    personas: [developer],
  },
  {
    id: '//lookervisbuilder.com',
    title: 'Custom Viz Builder',
    description:
      'A Web IDE/sandbox to help develop Looker Custom Visualizations.',
    url: 'https://lookervisbuilder.com/',
    contentTypes: [sandbox],
    platformFeatures: [customVisualization],
    personas: [developer, frontendDeveloper, analyst],
  },
  {
    id: '//www.npmjs.com/package/@looker/extension-sdk-react',
    title: 'Extension SDK: React',
    description:
      'The React Extension SDK npm package. This lets you build a Looker extension — See the Extension Framework Examples for examples.',
    url: 'https://www.npmjs.com/package/@looker/extension-sdk-react',
    contentTypes: [library],
    platformFeatures: [extensions],
    languages: [javascript],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//www.youtube.com/watch?v=3lbq5w7kcLs',
    title: 'Extension Framework Tutorial Video',
    description:
      'A JOIN 2021 tutorial video on developing with the Extension Framework.',
    url: 'https://www.youtube.com/watch?v=3lbq5w7kcLs',
    contentTypes: [tutorial, video],
    platformFeatures: [extensions],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//www.youtube.com/watch?v=DnIG0pD3UNA',
    title: 'Actions Tutorial Video',
    description: 'A JOIN 2021 tutorial video on creating actions.',
    url: 'https://www.youtube.com/watch?v=DnIG0pD3UNA',
    contentTypes: [tutorial, video],
    platformFeatures: [actions],
    personas: [developer, backendDeveloper],
  },
  {
    id: '//www.youtube.com/watch?v=ixwWGKyG3wA',
    title: 'Custom Viz Demo Video',
    description: 'An older demo of Lookers custom viz capabilities',
    url: 'https://www.youtube.com/watch?v=ixwWGKyG3wA',
    contentTypes: [tutorial, video],
    platformFeatures: [customVisualization],
    personas: [developer, frontendDeveloper, analyst],
  },
  {
    id: '//www.youtube.com/watch?v=kOanUnTMDpg',
    title: 'API Explorer & API Tutorial Video',
    description:
      'A JOIN 2021 tutorial video on using API Explorer and Looker API.',
    url: 'https://www.youtube.com/watch?v=kOanUnTMDpg',
    contentTypes: [tutorial, video],
    platformFeatures: [api],
    personas: [developer],
  },
  {
    id: '//www.youtube.com/watch?v=rSWX6oAOtMs',
    title: 'Visualization Components Demo Video',
    description:
      'A JOIN 2021 intro and demo video of the new visualization components.',
    url: 'https://www.youtube.com/watch?v=rSWX6oAOtMs',
    contentTypes: [demo, video],
    platformFeatures: [actions],
    personas: [developer, frontendDeveloper],
  },
  {
    id: '//www.youtube.com/watch?v=XTvJjCeAT74',
    title: 'Embed Tutorial Video',
    description: 'A JOIN 2021 tutorial video on Iframe and SSO Embedding.',
    url: 'https://www.youtube.com/watch?v=XTvJjCeAT74',
    contentTypes: [tutorial, video],
    platformFeatures: [embed],
    personas: [developer],
  },
];
