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
  Tooling = 'Tooling',
  Tutorial = 'Tutorial',
  ExampleDemo = 'Example/Demo',
  Dataset = 'Dataset',
  Docs = 'Docs',
}

// Enum serves as display strings too
export enum ResourceTag {
  Actions = 'Actions',
  API = 'API',
  Blocks = 'Blocks',
  Components = 'Components',
  CustomViz = 'Custom Viz',
  Embed = 'Embedding',
  Extensions = 'Extensions',
  Lookml = 'LookML',
  Other = 'Other',
  Studio = 'Studio',
  StudioCommunityConnector = 'Studio Community Connector',
  StudioCommunityVisualizations = 'Studio Community Visualizations',
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
    content: 'Repo for all action requirements and examples.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Actions,
    link: 'https://github.com/looker/actions',
    shortenedLink: 'https://goo.gle/3FrcpIk',
    title: 'Action Hub Repo',
  },
  {
    content: 'BigQuery ML Actions using Google Cloud Functions for Looker.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Actions,
    link: 'https://github.com/looker-open-source/bqml-actions',
    shortenedLink: 'https://goo.gle/3Fu67HZ',
    title: 'BigQuery ML Action',
  },
  {
    content:
      'Direct link to the directory of all complete Actions in the official action hub.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Actions,
    link: 'https://github.com/looker/actions/tree/master/src/actions',
    shortenedLink: 'https://goo.gle/3F7ZhXj',
    title: 'Actions Examples',
  },
  {
    content:
      'Mock ActionHub for local or serverless (Google Cloud Functions) use.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Actions,
    link: 'https://github.com/fabio-looker/sample-cloud-function-action',
    shortenedLink: 'https://goo.gle/3FqT6Pc',
    title: 'Mock ActionHub',
  },
  {
    content:
      'Learn how to write an action that exports the results of a Looker Query to BigQuery.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Actions,
    link: 'https://discourse.looker.com/t/export-the-results-of-a-looker-query-to-bigquery/9720',
    shortenedLink: 'https://goo.gle/3Ft73vY',
    title: 'BigQuery Writeback Action',
  },
  {
    content: 'A tutorial video on creating actions.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Actions,
    link: 'https://www.youtube.com/watch?v=DnIG0pD3UNA',
    shortenedLink: 'https://goo.gle/3FuGNS2',
    title: 'Actions Tutorial Video',
  },
  {
    content: 'An overview of Looker Actions API.',
    type: ResourceType.Docs,
    tag: ResourceTag.Actions,
    link: 'https://developers.looker.com/actions/overview',
    shortenedLink: 'https://goo.gle/3F7YXaO',
    title: 'Looker Actions Overview',
  },
  {
    content: 'An overview of Looker API.',
    type: ResourceType.Docs,
    tag: ResourceTag.API,
    link: 'https://developers.looker.com/api/overview',
    shortenedLink: 'https://goo.gle/3Fsz1If',
    title: 'Looker API Overview',
  },
  {
    content: 'An interactive API reference where you can call the Looker API.',
    type: ResourceType.Docs,
    tag: ResourceTag.API,
    link: 'https://hack.looker.com/extensions/marketplace_extension_api_explorer::api-explorer',
    shortenedLink: 'https://goo.gle/3Fw2IIJ',
    title: 'API Interactive Reference',
  },
  {
    content: 'A collection of links to API and SDK use cases.',
    type: ResourceType.Docs,
    tag: ResourceTag.API,
    link: 'https://community.looker.com/technical-tips-tricks-1021/selected-articles-about-looker-api-sdk-use-cases-26020',
    shortenedLink: 'https://goo.gle/3h2IfBQ',
    title: 'API and SDK Use Cases',
  },
  {
    content:
      'Generates all official Looker API SDKs and lets you create SDKs for any language',
    type: ResourceType.Tooling,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/sdk-codegen',
    shortenedLink: 'https://goo.gle/3FcbnyG',
    title: 'SDK Codegen',
  },
  {
    content:
      'Examples using our API SDKs in C#, Java, Kotlin, Python, R, Ruby, Swift, and TypeScript.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/sdk-codegen/tree/main/examples',
    shortenedLink: 'https://goo.gle/3FvjVSC',
    title: 'API SDK Examples',
  },
  {
    content:
      'A Google Apps Script that calls Looker API to load Looks, get data dictionaries, etc. (maybe out of date)',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.API,
    link: 'https://github.com/brechtv/looker_google_sheets',
    shortenedLink: 'https://goo.gle/3FsVJA1',
    title: 'Google Sheets Looker API Example',
  },
  {
    content:
      'List of official Looker API SDKs in Python, Typescript, Kotlin, Swift, C#, and Go.',
    type: ResourceType.Tooling,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/sdk-codegen#looker-sdks',
    shortenedLink: 'https://goo.gle/3F4V8Dt',
    title: 'Official API SDKs',
  },
  {
    content: 'Unofficial Looker API SDK for R',
    type: ResourceType.Tooling,
    tag: ResourceTag.API,
    link: 'https://github.com/looker-open-source/lookr',
    shortenedLink: 'https://goo.gle/3Ftx1zD',
    title: 'Looker API SDK (R)',
  },
  {
    content: 'Docs on Looker blocks, pre-built data models.',
    type: ResourceType.Docs,
    tag: ResourceTag.Blocks,
    link: 'https://cloud.google.com/looker/docs/blocks',
    shortenedLink: 'https://goo.gle/3VDSgEA',
    title: 'Blocks Documentation',
  },
  {
    content: 'Demo video of visualization components.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Components,
    link: 'https://www.youtube.com/watch?v=rSWX6oAOtMs',
    shortenedLink: 'https://goo.gle/3FuPjRd',
    title: 'Visualization Components Demo Video',
  },
  {
    content: `Try out Looker's visualization components`,
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Components,
    link: 'https://developers.looker.com/components/visualization-components',
    shortenedLink: 'https://goo.gle/3h8qyAF',
    title: 'Visualization Components Playground',
  },
  {
    content: `Overview of Looker UI Components for building Looker data experiences.`,
    type: ResourceType.Docs,
    tag: ResourceTag.Components,
    link: 'https://developers.looker.com/components/overview',
    shortenedLink: 'https://goo.gle/3FvGVRu',
    title: 'Looker UI Components Overview',
  },
  {
    content: 'An interactive reference of Looker UI Components',
    type: ResourceType.Docs,
    tag: ResourceTag.Components,
    link: 'https://components.looker.com',
    shortenedLink: 'https://goo.gle/3Fp44DV',
    title: 'Components Interactive Reference',
  },
  {
    content: 'Looker Custom Visualizations repository',
    type: ResourceType.Tooling,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/looker-open-source/custom_visualizations_v2',
    shortenedLink: 'https://goo.gle/3F7eLdN',
    title: 'Custom Visualizations v2 Repo',
  },
  {
    content: 'Looker Custom Visualization examples',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/looker-open-source/custom_visualizations_v2/tree/master/src/examples',
    shortenedLink: 'https://goo.gle/3h0bvcp',
    title: 'Custom Viz Examples',
  },
  {
    content: 'Looker custom vis web IDE/playground',
    type: ResourceType.Tooling,
    tag: ResourceTag.CustomViz,
    link: 'https://developers.looker.com/marketplace/custom-viz-builder',
    shortenedLink: 'https://goo.gle/3FsWWaJ',
    title: 'Custom Viz Builder',
  },
  {
    content: 'Get started with building a custom viz',
    type: ResourceType.Tutorial,
    tag: ResourceTag.CustomViz,
    link: 'https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/getting_started.md',
    shortenedLink: 'https://goo.gle/3Fui9kw',
    title: 'Get started with Custom Viz',
  },
  {
    content: 'An old demo of Lookers custom viz capabilities',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.CustomViz,
    link: 'https://youtu.be/ixwWGKyG3wA',
    shortenedLink: 'https://goo.gle/3Fw2IZf',
    title: 'Custom Viz Demo Video',
  },
  {
    content: 'An overview of Looker Embedding.',
    type: ResourceType.Docs,
    tag: ResourceTag.Embed,
    link: 'https://developers.looker.com/embed/overview',
    shortenedLink: 'https://goo.gle/3h9mLD8',
    title: 'Looker Embedding Overview',
  },
  {
    content: 'A video series to help you get started embedding.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Embed,
    link: 'https://www.youtube.com/watch?v=jXT6A0rBzs4&list=PLIivdWyY5sqL4qQAUdCUKComBWPNN8353',
    shortenedLink: 'https://goo.gle/3F5rrSB',
    title: 'Get started with embedding',
  },
  {
    content: 'Another tutorial video on embedding.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Embed,
    link: 'https://www.youtube.com/watch?v=XTvJjCeAT74',
    shortenedLink: 'https://goo.gle/3FvjW98',
    title: 'Embedding Tutorial Video',
  },
  {
    content:
      'The quick and easy way to embed Looker content in your web application',
    type: ResourceType.Tooling,
    tag: ResourceTag.Embed,
    link: 'https://github.com/looker-open-source/embed-sdk',
    shortenedLink: 'https://goo.gle/3F3nnSL',
    title: 'Embed SDK (Javascript)',
  },
  {
    content:
      'A web browser iframe host/client channel message manager, post message bridge.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Embed,
    link: 'https://github.com/looker-open-source/chatty',
    shortenedLink: 'https://goo.gle/3Ftdz5W',
    title: 'Chatty - Iframe Msg Manager',
  },
  {
    content: 'Tool to help troubleshoot SSO embed URLs.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Embed,
    link: 'https://fabio-looker.github.io/looker_sso_tool/',
    shortenedLink: 'https://goo.gle/3F7YXrk',
    title: 'SSO Embed Tool/Troubleshooter',
  },
  {
    content: 'SSO Embed Tool repository for you to extend or run locally.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Embed,
    link: 'https://github.com/fabio-looker/looker_sso_tool',
    shortenedLink: 'https://goo.gle/3F30Nde',
    title: 'SSO Embed Tool Source',
  },
  {
    content: "A comprehensive demo of Looker's embedding capabilities",
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Embed,
    link: 'https://atomfashion.io/',
    shortenedLink: 'https://goo.gle/3F1hy8B',
    title: 'Embedding Demo',
  },
  {
    content: 'A repository of React embedding examples',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Embed,
    link: 'https://github.com/looker-open-source/LookerEmbedReference',
    shortenedLink: 'https://goo.gle/3FpYjqx',
    title: 'Looker Embed Reference (React)',
  },
  {
    content: 'An overview of Looker Extensions.',
    type: ResourceType.Docs,
    tag: ResourceTag.Extensions,
    link: 'https://developers.looker.com/extensions/overview',
    shortenedLink: 'https://goo.gle/3FsVJQx',
    title: 'Looker Extensions Overview',
  },
  {
    content: 'How to develop with the Extension Framework.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Extensions,
    link: 'https://www.youtube.com/watch?v=3lbq5w7kcLs',
    shortenedLink: 'https://goo.gle/3FtO4l5',
    title: 'Extension Framework Tutorial Video',
  },
  {
    content: 'Easily create extensions with zero manual configuration.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/create-looker-extension',
    shortenedLink: 'https://goo.gle/3h9mLTE',
    title: 'Extension Creation Utility',
  },
  {
    content:
      'Repo of multiple Extension examples using Typescript, Javascript, React, and Redux',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples',
    shortenedLink: 'https://goo.gle/3Fqu8j5',
    title: 'Extension Framework Examples',
  },
  {
    content: `A great starting point and demonstrates Extension SDK's functionality`,
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/kitchensink',
    shortenedLink: 'https://goo.gle/3F60qyi',
    title: 'Kitchensink Extension Example',
  },
  {
    content: 'The React Extension SDK npm package to build a Looker extension.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Extensions,
    link: 'https://www.npmjs.com/package/@looker/extension-sdk-react',
    shortenedLink: 'https://goo.gle/3F22Jm9',
    title: 'Extension SDK NPM Package (React)',
  },
  {
    content: 'Shows how to write a extension that needs an access key to run.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/extension-examples/tree/main/react/typescript/access-key-demo',
    shortenedLink: 'https://goo.gle/3F3q8DG',
    title: 'Access Key Extension Example',
  },
  {
    content: 'An early-stage mockup of a Twitter-style Looker Extension.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/bryan-at-looker/looker-feed',
    shortenedLink: 'https://goo.gle/3F7Ziul',
    title: 'Looker Feed Extension Mockup',
  },
  {
    content:
      'Look At Me Sideways (LAMS) is the official LookML style guide and linter to help you create maintainable LookML projects.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker-open-source/look-at-me-sideways',
    shortenedLink: 'https://goo.gle/3h6I4Fp',
    title: 'LookML Style Guide & Linter',
  },
  {
    content: 'Vim syntax for LookML. (may be out of date)',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/thalesmello/lkml.vim',
    shortenedLink: 'https://goo.gle/3iHcNtr',
    title: 'LookML Vim Syntax',
  },
  {
    content: 'VSCode syntax for LookML. (may be out of date)',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/Ladvien/vscode-looker',
    shortenedLink: 'https://goo.gle/3F3no9h',
    title: 'LookML VSCode Syntax',
  },
  {
    content:
      'How to use an AWS Lambda function to sync your LookML models to changing schemas.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.Lookml,
    link: 'https://community.looker.com/lookml-5/automating-frequently-changing-schemas-with-aws-lambda-10196',
    shortenedLink: 'https://goo.gle/3FuGOp4',
    title: 'Automatically Sync Schema Changes',
  },
  {
    content:
      'Repo of tools to follow best practices when developing LookML files. (may be out of date)',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/ww-tech/lookml-tools',
    shortenedLink: 'https://goo.gle/3F1hyp7',
    title: 'LookML Tools by WW',
  },
  {
    content:
      'Script to create LookML View of tables with JSON objects. (may be out of date)',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/leighajarett/JSON_to_LookML',
    shortenedLink: 'https://goo.gle/3Fti28L',
    title: 'JSON To LookML',
  },
  {
    content: 'A LookML parser and serializer in Python.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/joshtemple/lkml',
    shortenedLink: 'https://goo.gle/3EZ8qRM',
    title: 'LookML parser',
  },
  {
    content:
      'A Snowflake based LookML that demos the digital marketing landscape.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker-open-source/marketing_demo',
    shortenedLink: 'https://goo.gle/3F30NtK',
    title: 'Digital Marketing Demo',
  },
  {
    content: 'A BigQuery based LookML that demos the healthcare landscape.',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Lookml,
    link: 'https://github.com/looker-open-source/healthcare_demo',
    shortenedLink: 'https://goo.gle/3EWGLks',
    title: 'Healthcare Demo',
  },
  {
    content:
      'Henry is a command line tool that finds model bloat in your Looker instance and identifies unused content in models and explores.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Other,
    link: 'https://github.com/looker-open-source/henry',
    shortenedLink: 'https://goo.gle/3F4fY5U',
    title: 'Henry',
  },
  {
    content:
      'This extension provides a UI to discover your schema relationships. Also available in marketplace',
    type: ResourceType.ExampleDemo,
    tag: ResourceTag.Extensions,
    link: 'https://github.com/looker-open-source/app-data-dictionary',
    shortenedLink: 'https://goo.gle/3F6q2eE',
    title: 'Data Dictionary Extension Example',
  },
  {
    content: `Browse Google Cloud Marketplace's public datasets available via BigQuery`,
    type: ResourceType.Dataset,
    tag: ResourceTag.Other,
    link: 'https://console.cloud.google.com/marketplace/browse?filter=solution-type:dataset',
    shortenedLink: 'https://goo.gle/3F4gsca',
    title: 'Google Cloud Public Datasets',
  },
  {
    content: 'Explore additional public datasets shared via BigQuery',
    type: ResourceType.Dataset,
    tag: ResourceTag.Other,
    link: 'https://cloud.google.com/bigquery/public-data#other_public_datasets',
    shortenedLink: 'https://goo.gle/3F22XcR',
    title: 'Other BigQuery Public Datasets',
  },
  {
    content: 'Prebuilt dashboards for immediate access to COVID-19 data.',
    type: ResourceType.Dataset,
    tag: ResourceTag.Other,
    link: 'https://covid19response.cloud.looker.com/embed/dashboards-next/51',
    shortenedLink: 'https://goo.gle/3FuPkof',
    title: 'COVID-19 Dashboards',
  },
  {
    content: 'An awesome list of awesome Looker projects. (maybe out of date)',
    type: ResourceType.Tooling,
    tag: ResourceTag.Other,
    link: 'https://gitlab.com/alison985/awesome-looker/-/tree/main',
    shortenedLink: 'https://goo.gle/3Ftx26F',
    title: 'Awesome Looker Projects',
  },
  {
    content:
      'A command line tool to navigate and manage Spaces, Looks, and Dashboards.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Other,
    link: 'https://github.com/looker-open-source/gzr',
    shortenedLink: 'https://goo.gle/3F7Tv7O',
    title: 'Gzr',
  },
  {
    content: 'An automated EAV builder for EAV schemas.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Other,
    link: 'https://github.com/fabio-looker/eav-builder',
    shortenedLink: 'https://goo.gle/3F7Tvok',
    title: 'EAV Builder',
  },
  {
    content:
      'A tool to persist descriptions from your dbt project to your lookml project.',
    type: ResourceType.Tooling,
    tag: ResourceTag.Other,
    link: 'https://github.com/fishtown-analytics/dbtdocs-to-lookml',
    shortenedLink: 'https://goo.gle/3F7TvEQ',
    title: 'DBTdocs To LookML',
  },
  {
    content:
      'Configure and forward users directly to a Looker Studio report via a URL.',
    type: ResourceType.Docs,
    tag: ResourceTag.Studio,
    link: 'https://developers.google.com/looker-studio/integrate/linking-api',
    shortenedLink: 'https://goo.gle/3P3JH3v',
    title: 'Studio Linking API Docs',
  },
  {
    content:
      'Enables direct connections from Looker Studio to any internet accessible data source.',
    type: ResourceType.Docs,
    tag: ResourceTag.StudioCommunityConnector,
    link: 'https://developers.google.com/looker-studio/connector',
    shortenedLink: 'https://goo.gle/3UxYdBr',
    title: 'Studio Community Connector Docs',
  },
  {
    content: 'Codelab tutorial on building a Studio Community Connector.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.StudioCommunityConnector,
    link: 'https://codelabs.developers.google.com/codelabs/community-connectors',
    shortenedLink: 'https://goo.gle/3h3SmGq',
    title: 'Studio Community Connector Codelab',
  },
  {
    content:
      'Allow you to build and use your own custom visualizations in Looker Studio.',
    type: ResourceType.Docs,
    tag: ResourceTag.StudioCommunityVisualizations,
    link: 'https://developers.google.com/looker-studio/visualization',
    shortenedLink: 'https://goo.gle/3XZScR4',
    title: 'Studio Community Visualizations Docs',
  },
  {
    content: 'Codelab tutorial on building a Studio Community Visualization.',
    type: ResourceType.Tutorial,
    tag: ResourceTag.StudioCommunityVisualizations,
    link: 'https://codelabs.developers.google.com/codelabs/community-visualization/',
    shortenedLink: 'https://goo.gle/3Y4yW52',
    title: 'Studio Community Visualization Codelab',
  },
]
