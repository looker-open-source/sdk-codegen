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

// Enum serves as display strings too
export enum ResourceType {
  Resource = 'Resource',
  Tutorial = 'Tutorial',
  Example = 'Example',
}

// Enum serves as display strings too
export enum ResourceTag {
  Embed = 'Embed',
  Extensions = 'Extensions',
  Lookml = 'LookML',
  Actions = 'Actions',
  API = 'API',
  Devtool = 'Dev Tools',
  Components = 'Components',
  Datasets = 'Datasets',
  CustomViz = 'Custom Viz',
  Other = 'Other',
}

export interface Resource {
  content: string
  type: ResourceType
  tag: ResourceTag
  link: string
  shortenedLink: string
  title: string
}

export const resources: Array<Resource> = [
  {
    content: 'A JOIN 2021 tutorial video on creating actions.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Actions,
    link: 'https://www.youtube.com/watch?v=DnIG0pD3UNA',
    shortenedLink: 'https://bit.ly/3k4iEqw',
    title: 'Actions Tutorial Video',
  },
  {
    content:
      'A JOIN 2021 intro and demo video of the new visualization components.',
    type: ResourceType.Resource,
    tag: ResourceTag.Components,
    link: 'https://www.youtube.com/watch?v=rSWX6oAOtMs',
    shortenedLink: 'https://bit.ly/3nQxGkr',
    title: 'Visualization Components Demo Video',
  },
  {
    content:
      'A JOIN 2021 tutorial video on developing with the Extension Framework.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Extensions,
    link: 'https://www.youtube.com/watch?v=3lbq5w7kcLs',
    shortenedLink: 'https://bit.ly/3jXck3Y',
    title: 'Extension Framework Tutorial Video',
  },
  {
    content: 'A JOIN 2021 tutorial video on using API Explorer and Looker API.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.API,
    link: 'https://youtu.be/kOanUnTMDpg',
    shortenedLink: 'https://bit.ly/3wsOa6t',
    title: 'API Explorer & API Tutorial Video',
  },
  {
    content: 'A JOIN 2021 tutorial video on Iframe and SSO Embedding.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Embed,
    link: 'https://www.youtube.com/watch?v=XTvJjCeAT74',
    shortenedLink: 'https://bit.ly/3q1f0RR',
    title: 'Embed Tutorial Video',
  },
  {
    content: `An interactive demonstration of Looker's new Visualization Components`,
    type: ResourceType.Resource,
    tag: ResourceTag.Components,
    link: 'https://developers.looker.com/components/visualization-components',
    shortenedLink: 'https://bit.ly/3D0AdiE',
    title: 'Visualization Components Playground',
  },
  {
    content:
      'Create extensions with zero manual configuration with the create-looker-extension utility.',
    type: ResourceType.Resource,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/create-looker-extension',
    shortenedLink: 'https://bit.ly/3k6vcNW',
    title: 'Extension Creation Utility',
  },
  {
    content: 'The API Explorer lets you learn and interact with Looker API.',
    type: ResourceType.Resource,
    tag: ResourceTag.API,
    link: 'https://hack.looker.com/extensions/marketplace_extension_api_explorer::api-explorer',
    shortenedLink: 'https://bit.ly/2YtLrwT',
    title: 'API Explorer',
  },
  {
    content: 'Gzr is a Looker Content Utility developer tool',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/looker-open-source/gzr',
    shortenedLink: 'https://bit.ly/3mSyZiu',
    title: 'Gzr',
  },
  {
    content:
      'The SDK Codegen is the source of truth for all SDKs and lets you create them for any language',
    type: ResourceType.Resource,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/sdk-codegen',
    shortenedLink: 'https://bit.ly/3lIk23g',
    title: 'SDK Codegen',
  },
  {
    content:
      'Our collection of SDK examples currently in: C#, Java, Kotlin, Python, R, Ruby, Swift, and TypeScript.',
    type: ResourceType.Resource,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/sdk-codegen/tree/main/examples',
    shortenedLink: 'https://bit.ly/3AL4VdI',
    title: 'SDK Examples',
  },
  {
    content:
      'Look At Me Sideways (LAMS) is the official LookML style guide and linter to help you create maintainable LookML projects.',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/looker-open-source/look-at-me-sideways',
    shortenedLink: 'https://bit.ly/3DOrMGS',
    title: 'LookML Style Guide & Linter',
  },
  {
    content:
      'Looker Components are a collection of tools for building Looker data experiences.',
    type: ResourceType.Resource,
    tag: ResourceTag.Components,
    link: 'https://components.looker.com/',
    shortenedLink: 'https://bit.ly/2Z2Q69C',
    title: 'Looker Components',
  },
  {
    content: 'Looker Components Storybook contains component examples',
    type: ResourceType.Resource,
    tag: ResourceTag.Components,
    link: 'https://components.looker.com/storybook',
    shortenedLink: 'https://bit.ly/3pbpygP',
    title: 'Components Examples Storybook',
  },
  {
    content:
      'The Looker JavaScript Embed SDK makes embedding Looker content in your web application easy!',
    type: ResourceType.Resource,
    tag: ResourceTag.Embed,
    link: 'https://github.com/looker-open-source/embed-sdk',
    shortenedLink: 'https://bit.ly/3n2mDEJ',
    title: 'Embed SDK',
  },
  {
    content:
      'Henry is a command line tool that finds model bloat in your Looker instance and identifies unused content in models and explores.',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/looker-open-source/henry',
    shortenedLink: 'https://bit.ly/3j1NShp',
    title: 'Henry',
  },
  {
    content:
      'A repository with multiple Extension Framework examples using Typescript, Javascript, React, and Redux',
    type: ResourceType.Example,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples',
    shortenedLink: 'https://bit.ly/2YYdlkM',
    title: 'Extension Framework Examples',
  },
  {
    content: `This example demonstrates most of Extension SDK's functionality and is a great starting point.`,
    type: ResourceType.Example,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/kitchensink',
    shortenedLink: 'https://bit.ly/3n1zbMk',
    title: 'Extension Example: Kitchensink',
  },
  {
    content:
      'The React Extension SDK npm package. This lets you build a Looker extension — See the Extension Framework Examples for examples.',
    type: ResourceType.Resource,
    tag: ResourceTag.Extensions,
    link: 'https://www.npmjs.com/package/@looker/extension-sdk-react',
    shortenedLink: 'https://bit.ly/3pbzoPN',
    title: 'Extension SDK: React',
  },
  {
    content:
      'Chatty is a simple web browser iframe host/client channel message manager. We use it for iframe communication.',
    type: ResourceType.Resource,
    tag: ResourceTag.Embed,
    link: 'https://github.com/looker-open-source/chatty',
    shortenedLink: 'https://bit.ly/2Z2NrfP',
    title: 'Chatty - Iframe Msg Manager',
  },
  {
    content:
      'A Snowflake based LookML that demonstrates Looker’s value in the digital marketing landscape.',
    type: ResourceType.Example,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker-open-source/marketing_demo',
    shortenedLink: 'https://bit.ly/2YR9rKN',
    title: 'Digital Marketing Demo',
  },
  {
    content:
      'A BigQuery based LookML that demonstrates Looker’s value in the healthcare landscape.',
    type: ResourceType.Example,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker-open-source/healthcare_demo',
    shortenedLink: 'https://bit.ly/3FUokfN',
    title: 'Healthcare Demo',
  },
  {
    content:
      'This is the official Looker Data Dictionary, fully open source and available as an example.',
    type: ResourceType.Example,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/app-data-dictionary',
    shortenedLink: 'https://bit.ly/3vhMlZh',
    title: 'Data Dictionary Extension',
  },
  {
    content:
      'Thinking of doing a data analysis project for your hack? Browse and explore BigQuery public datasets through the hackathon instance',
    type: ResourceType.Resource,
    tag: ResourceTag.Datasets,
    link: 'https://hack.looker.com/dashboards/16',
    shortenedLink: 'https://bit.ly/3FX72yF',
    title: 'Public Datasets',
  },
  {
    content:
      'This COVID-19 Block consists of LookML models, pre-built dashboards, and explores. The underlying data is only available in BigQuery.',
    type: ResourceType.Example,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker/covid19/blob/master/readme.md',
    shortenedLink: 'https://bit.ly/3DPVWd5',
    title: 'COVID-19 Data Block',
  },
  {
    content: 'Prebuilt dashboards for immediate access to COVID-19 data.',
    type: ResourceType.Resource,
    tag: ResourceTag.Lookml,
    link: 'https://covid19response.cloud.looker.com/embed/dashboards-next/51',
    shortenedLink: 'https://bit.ly/3n87txG',
    title: 'COVID-19 Dashboards',
  },
  {
    content:
      'This example demonstrates how to write a Looker extension that needs an access key to run.',
    type: ResourceType.Example,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/access-key-demo',
    shortenedLink: 'https://bit.ly/3C6UXo8',
    title: 'Extension Example: Access Key',
  },
  {
    content: 'An early-stage mockup of a Twitter-style Looker Extension.',
    type: ResourceType.Example,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/bryan-at-looker/looker-feed',
    shortenedLink: 'https://bit.ly/3jhbyyu',
    title: 'Looker Feed Extension Mockup',
  },
  {
    content:
      'The official Looker Action Hub repository for all your action requirements and examples.',
    type: ResourceType.Example,
    tag: ResourceTag.Actions,
    link: 'https://github.com/looker/actions',
    shortenedLink: 'https://bit.ly/3pc2vTa',
    title: 'Action Hub',
  },
  {
    content:
      'Direct link to the directory of all complete Actions in the official action hub.',
    type: ResourceType.Example,
    tag: ResourceTag.Actions,
    link: 'https://github.com/looker/actions/tree/master/src/actions',
    shortenedLink: 'https://bit.ly/3vrwzeM',
    title: 'Actions Examples',
  },
  {
    content:
      'Mock ActionHub for local or serverless (Google Cloud Functions) use.',
    type: ResourceType.Example,
    tag: ResourceTag.Actions,
    link: 'https://github.com/fabio-looker/sample-cloud-function-action',
    shortenedLink: 'https://bit.ly/3lSdCOU',
    title: 'Mock ActionHub',
  },
  {
    content:
      'Learn how to write an action that exports the results of a Looker Query to BigQuery.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Actions,
    link: 'https://discourse.looker.com/t/export-the-results-of-a-looker-query-to-bigquery/9720',
    shortenedLink: 'https://bit.ly/3jeJICU',
    title: 'BigQuery Writeback Action',
  },
  {
    content:
      'The official repository of Looker Custom Visualizations API and examples',
    type: ResourceType.Example,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/looker/custom_visualizations_v2',
    shortenedLink: 'https://bit.ly/3FYL2ni',
    title: 'Custom Visualizations v2',
  },
  {
    content: 'Direct link to Looker Custom Visualization examples',
    type: ResourceType.Example,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/looker/custom_visualizations_v2/tree/master/src/examples',
    shortenedLink: 'https://bit.ly/3n3LRCE',
    title: 'Custom Viz Examples',
  },
  {
    content: 'A Web IDE to help develop Looker Custom Visualizations.',
    type: ResourceType.Resource,
    tag: ResourceTag.CustomViz,
    link: 'https://lookervisbuilder.com/',
    shortenedLink: 'https://bit.ly/3G2iHfw',
    title: 'Custom Viz Builder',
  },
  {
    content: 'A tutorial to build a custom viz development environment',
    type: ResourceType.Tutorial,
    tag: ResourceTag.CustomViz,
    link: 'https://discourse.looker.com/t/creating-a-development-environment-for-custom-visualizations/8470',
    shortenedLink: 'https://bit.ly/3DRnZc2',
    title: 'Custom Viz Dev Environment Setup',
  },
  {
    content:
      'An old example custom viz development environment developed by Headset. (may be out of date)',
    type: ResourceType.Example,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/Headset/looker-environment',
    shortenedLink: 'https://bit.ly/30EsLLL',
    title: 'Custom Vis Dev Environment Example',
  },
  {
    content: 'An older demo of Lookers custom viz capabilities',
    type: ResourceType.Resource,
    tag: ResourceTag.CustomViz,
    link: 'https://youtu.be/ixwWGKyG3wA',
    shortenedLink: 'https://bit.ly/2Z0MtjU',
    title: 'Custom Viz Demo Video',
  },
  {
    content:
      'This Google Apps Script uses Looker API to load Looks, get data dictionaries, etc.',
    type: ResourceType.Example,
    tag: ResourceTag.API,
    link: 'https://github.com/brechtv/looker_google_sheets',
    shortenedLink: 'https://bit.ly/3BUdkg1',
    title: 'Looker API for Google Sheets',
  },
  {
    content:
      'This tool helps you troubleshoot SSO embed URLs generated by your scripts.',
    type: ResourceType.Resource,
    tag: ResourceTag.Embed,
    link: 'https://fabio-looker.github.io/looker_sso_tool/',
    shortenedLink: 'https://bit.ly/30IY8F7',
    title: 'SSO Embed Tool',
  },
  {
    content:
      'The source code for the SSO embed tool for you to extend or run locally.',
    type: ResourceType.Example,
    tag: ResourceTag.Embed,
    link: 'https://github.com/fabio-looker/looker_sso_tool',
    shortenedLink: 'https://bit.ly/3n3MDzj',
    title: 'SSO Embed Tool Source',
  },
  {
    content: 'Vim syntax for LookML. (may be out of date)',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/thalesmello/lkml.vim',
    shortenedLink: 'https://bit.ly/3G2qJFe',
    title: 'LookML Vim Syntax',
  },
  {
    content: 'VSCode syntax for LookML. (may be out of date)',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/Ladvien/vscode-looker',
    shortenedLink: 'https://bit.ly/3lShYFK',
    title: 'LookML VSCode Syntax',
  },
  {
    content: 'An automated EAV builder for EAV schemas.',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/fabio-looker/eav-builder',
    shortenedLink: 'https://bit.ly/2Xobcy8',
    title: 'EAV Builder',
  },
  {
    content:
      'Learn how to set up your Looker instance to poll and make changes to your LookML model with an AWS Lambda function.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Devtool,
    link: 'https://discourse.looker.com/t/automating-frequently-changing-schemas-with-aws-lambda/10196',
    shortenedLink: 'https://bit.ly/3lTyoOo',
    title: 'Automate Schema Changes',
  },
  {
    content:
      'Developed by WW, this repository contains tools to handle best practices with developing LookML files.',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/ww-tech/lookml-tools',
    shortenedLink: 'https://bit.ly/3vo5r01',
    title: 'LookML Tools',
  },
  {
    content:
      'This script was designed for data tables with JSON objects. It creates a LookML view file with a dimension for each JSON object field. (may be out of date)',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/leighajarett/JSON_to_LookML',
    shortenedLink: 'https://bit.ly/3lR2xhe',
    title: 'JSON To LookML',
  },
  {
    content:
      'A tool to persist descriptions from your dbt project to your lookml project.',
    type: ResourceType.Example,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/fishtown-analytics/dbtdocs-to-lookml',
    shortenedLink: 'https://bit.ly/2Z81Szd',
    title: 'DBTdocs To LookML',
  },
  {
    content: 'A LookML parser and serializer implemented in Python.',
    type: ResourceType.Resource,
    tag: ResourceTag.Devtool,
    link: 'https://github.com/joshtemple/lkml',
    shortenedLink: 'https://bit.ly/3lTzc5S',
    title: 'LookML parser',
  },
  {
    content: "A comprehensive demo of Looker's embedding capabilities",
    type: ResourceType.Example,
    tag: ResourceTag.Embed,
    link: 'https://atomfashion.io/',
    shortenedLink: 'https://bit.ly/3BUogKR',
    title: 'Embed Demo',
  },
  {
    content: 'An awesome list of awesome Looker projects.',
    type: ResourceType.Resource,
    tag: ResourceTag.Other,
    link: 'https://gitlab.com/alison985/awesome-looker/-/tree/main',
    shortenedLink: 'https://bit.ly/3DSZzPw',
    title: 'Awesome Looker Projects',
  },
  {
    content: 'Looker 3.0 SDK for R',
    type: ResourceType.Example,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/lookr',
    shortenedLink: 'https://bit.ly/3vfJwIr',
    title: 'Looker R SDK 3.0',
  },
]
