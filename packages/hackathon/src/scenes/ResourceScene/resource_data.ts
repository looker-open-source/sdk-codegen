/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
export const resources = [
  {
    id: 1,
    content: 'The API Explorer lets you learn + interact with the Looker API.',
    type: 'Resource',
    tag: 'api',
    link:
      'https://hack.looker.com/extensions/marketplace_git_github_com_looker_open_source_extension_api_explorer_git::api-explorer',
    title: 'API Explorer',
  },
  {
    id: 2,
    content: 'Gzr is a Looker Content Utility developer tool',
    type: 'Example',
    tag: 'devtool',
    link: 'https://github.com/looker-open-source/gzr',
    title: 'Gzr',
  },
  {
    id: 3,
    content: "LookR is the Looker SDK. It's in need of some revitalization!",
    type: 'Example',
    tag: 'api',
    link: 'https://github.com/looker-open-source/lookr',
    title: 'LookR SDK',
  },
  {
    id: 4,
    content:
      'The SDK Codegen is the source of truth for all SDKs and lets you create them for any language',
    type: 'Resource',
    tag: 'api',
    link: 'https://github.com/looker-open-source/sdk-codegen',
    title: 'SDK Codegen',
  },
  {
    id: 5,
    content:
      'These are all the examples we catalog for our SDKs. Currently: C#, Java, Kotlin, Python, R, Ruby, Swift, and Typescript.',
    type: 'Resource',
    tag: 'api',
    link:
      'https://github.com/looker-open-source/sdk-codegen/tree/master/examples',
    title: 'SDK Examples',
  },
  {
    id: 6,
    content:
      "LAMS is a style guide and linter for Looker's LookML data modeling language. It is designed to help a team of developers to produce more maintainable LookML projects.",
    type: 'Example',
    tag: 'devtool',
    link: 'https://github.com/looker-open-source/look-at-me-sideways',
    title: 'Look At Me Sideways',
  },
  {
    id: 7,
    content:
      'Looker Components are a collection of tools for building Looker data experiences.',
    type: 'Resource',
    tag: 'other',
    link: 'https://components.looker.com/',
    title: 'Looker Components',
  },
  {
    id: 7,
    content:
      'Looker Components are a collection of tools for building Looker data experiences. Check out the storybook for examples.',
    type: 'Resource',
    tag: 'other',
    link: 'https://components.looker.com/storybook',
    title: 'Components Storybook',
  },
  {
    id: 8,
    content:
      'The Looker JavaScript Embed SDK is designed to facilitate using Looker embedded content in your web application. It makes embedding easy!',
    type: 'Resource',
    tag: 'embed',
    link: 'https://github.com/looker-open-source/embed-sdk',
    title: 'Embed SDK',
  },
  {
    id: 9,
    content:
      'Henry is a command line tool that helps determine model bloat in your Looker instance and identify unused content in models and explores.',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/looker-open-source/henry',
    title: 'Henry',
  },
  {
    id: 10,
    content:
      "This is a simple React based extension template. It's functional out of the box and a great starting point.",
    type: 'example',
    tag: 'extension',
    link: 'https://github.com/looker-open-source/extension-template-react',
    title: 'Extension Template: React',
  },
  {
    id: 11,
    content:
      'This repository serves as a template for creating a new Looker Extension using React and Redux.',
    type: 'example',
    tag: 'extension',
    link: 'https://github.com/looker-open-source/extension-template-redux',
    title: 'Extension Template: Redux',
  },
  {
    id: 12,
    content:
      "This repository demonstrates all the functionality that is available to the Extension SDK. It's a great starting point for developing your own extensions.",
    type: 'example',
    tag: 'extension',
    link:
      'https://github.com/looker-open-source/extension-template-kitchensink',
    title: 'Extension Template: KitchenSink',
  },
  {
    id: 13,
    content:
      'The spec for the React Extension SDK. This lets you build a Looker extension— See the templates for more.',
    type: 'resource',
    tag: 'extension',
    link: 'https://www.npmjs.com/package/@looker/extension-sdk-react',
    title: 'Extension SDK: React',
  },
  {
    id: 14,
    content:
      'Chatty is a simple web browser iframe host/client channel message manager. We use it for iframe communication.',
    type: 'resources',
    tag: 'embed',
    link: 'https://github.com/looker-open-source/chatty',
    title: 'Chatty',
  },
  {
    id: 15,
    content:
      'This repository contains the Snowflake based LookML, for both the model and dashboards, for demonstrating Looker’s ability to provide value within the digital marketing landscape.',
    type: 'example',
    tag: 'lookml',
    link: 'https://github.com/looker-open-source/marketing_demo',
    title: 'Digital Marketing Demo',
  },
  {
    id: 15,
    content:
      'This repository contains the BigQuery based LookML, for both the model and dashboards, for demonstrating Looker’s ability to provide value within the healthcare landscape.',
    type: 'example',
    tag: 'lookml',
    link: 'https://github.com/looker-open-source/healthcare_demo',
    title: 'Healthcare Demo',
  },
  {
    id: 16,
    content:
      'This is the official Looker Data Dictionary, fully open source and available as an example.',
    type: 'example',
    tag: 'extension',
    link: 'https://github.com/looker-open-source/app-data-dictionary',
    title: 'Data Dictionary Extension',
  },
  {
    id: 17,
    content:
      'This COVID-19 Block consists of LookML models, pre-built dashboards, and explores. The data that powers the block is currently only available in BigQuery and will work with any Looker instance with an existing BigQuery connection.',
    type: 'example',
    tag: 'lookml',
    link: 'https://github.com/looker/covid19/blob/master/readme.md',
    title: 'COVID-19 Data Block',
  },
  {
    id: 18,
    content:
      'For immediate access to the frontend COVID-19 data, use our prebuilt models.',
    type: 'resource',
    tag: 'lookml',
    link: 'https://covid19response.cloud.looker.com/embed/dashboards-next/51',
    title: 'COVID-19 Prebuilt Dashboards',
  },
  {
    id: 19,
    content:
      'This repository demonstrates how to write a Looker extension that needs an access key to run.',
    type: 'example',
    tag: 'extension',
    link: 'https://github.com/looker-open-source/extension-access-key-demo',
    title: 'Extension Template: Access Key',
  },
  {
    id: 20,
    content: 'A very early-stage mockup of a Twitter-style Looker Extension.',
    type: 'example',
    tag: 'extension',
    link: 'https://github.com/bryan-at-looker/looker-feed',
    title: 'Looker Feed',
  },
  {
    id: 21,
    content:
      'The official Looker Action Hub repository, for all your action requirements. It is full of examples.',
    type: 'example',
    tag: 'action',
    link: 'https://github.com/looker/actions',
    title: 'Action Hub',
  },
  {
    id: 22,
    content:
      'Direct link to the directory with all the complete Actions in the official action hub.',
    type: 'example',
    tag: 'action',
    link: 'https://github.com/looker/actions/tree/master/src/actions',
    title: 'Actions Examples',
  },
  {
    id: 23,
    content:
      'Simple Mock ActionHub for local or serverless (GCF) use. Super useful as a starter.',
    type: 'example',
    tag: 'action',
    link: 'https://github.com/fabio-looker/sample-cloud-function-action',
    title: 'Cloud Function Action Template',
  },
  {
    id: 24,
    content:
      'Write an action that exports the Results of a Looker Query to BigQuery',
    type: 'tutorial',
    tag: 'action',
    link:
      'https://discourse.looker.com/t/export-the-results-of-a-looker-query-to-bigquery/9720',
    title: 'Bigquery writeback action',
  },
  {
    id: 25,
    content:
      'The official API and examples repo for Looker Custom Visualizations',
    type: 'example',
    tag: 'viz',
    link: 'https://github.com/looker/custom_visualizations_v2',
    title: 'Looker Custom Viz v2',
  },
  {
    id: 26,
    content:
      'Direct link to the examples repo for Looker Custom Visualizations',
    type: 'example',
    tag: 'viz',
    link:
      'https://github.com/looker/custom_visualizations_v2/tree/master/src/examples',
    title: 'Custom Viz Examples',
  },
  {
    id: 27,
    content: 'Web IDE to help developer Looker custom visualizations',
    type: 'resource',
    tag: 'viz',
    link: 'https://lookervisbuilder.com/',
    title: 'Looker Vis Builder',
  },
  {
    id: 28,
    content:
      'Very thorough tutorial to build a custom viz development environment',
    type: 'tutorial',
    tag: 'viz',
    link:
      'https://discourse.looker.com/t/creating-a-development-environment-for-custom-visualizations/8470',
    title: 'Creating a Development Environment for Custom Visualizations',
  },
  {
    id: 29,
    content:
      'An example custom viz development environment, developed by Headset',
    type: 'example',
    tag: 'viz',
    link: 'https://github.com/Headset/looker-environment',
    title: 'Viz development environment example',
  },
  {
    id: 29,
    content: 'An older demo of Lookers custom viz capabilities',
    type: 'resource',
    tag: 'viz',
    link: 'https://youtu.be/ixwWGKyG3wA',
    title: 'Custom Viz Demo Video',
  },
  {
    id: 30,
    content:
      'This Google Apps Script uses Looker API to load Looks, get data dictionaries, etc.',
    type: 'example',
    tag: 'api',
    link: 'https://github.com/brechtv/looker_google_sheets',
    title: 'Looker API for Google Sheets',
  },
  {
    id: 31,
    content:
      'This is by far the best way to troubleshoot SSO embed URLs generated by your scripts',
    type: 'resource',
    tag: 'embed',
    link: 'https://fabio-looker.github.io/looker_sso_tool/',
    title: 'SSO Embed Tool',
  },
  {
    id: 32,
    content:
      'If you want to make your own or improve it: This is the code for the best way to troubleshoot SSO embed URLs generated by your scripts',
    type: 'example',
    tag: 'embed',
    link: 'https://github.com/fabio-looker/looker_sso_tool',
    title: 'SSO Embed Tool source code',
  },
  {
    id: 33,
    content: 'An awesome example of an ever-useful LookML Style Guide',
    type: 'example',
    tag: 'lookml',
    link: 'https://github.com/mattm/lookml-style-guide',
    title: 'Matts LookML Style Guide',
  },
  {
    id: 34,
    content: 'vim syntax for LookML',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/thalesmello/lkml.vim',
    title: 'lkml.vim',
  },
  {
    id: 35,
    content: 'VSCode syntax for LookML',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/Ladvien/vscode-looker',
    title: 'VSCode Looker',
  },
  {
    id: 36,
    content:
      'Automated EAV builder for... EAV schemas! Turn this into an extension!',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/fabio-looker/eav-builder',
    title: 'EAV Builder',
  },
  {
    id: 37,
    content:
      'Basic instructions on how to deploy an AWS Lambda function and set up your Looker instance to poll an initiate changes to your LookML model through the Lambda function.',
    type: 'tutorial',
    tag: 'devtool',
    link:
      'https://discourse.looker.com/t/automating-frequently-changing-schemas-with-aws-lambda/10196',
    title: 'Automating schemas w/ Lambda',
  },
  {
    id: 38,
    content:
      'Developed by WW, This repository contains some tools to handle best practices of a set of developers working on LookML files.',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/ww-tech/lookml-tools',
    title: 'LookML Tools',
  },
  {
    id: 39,
    content:
      'This script was designed for Looker users who have columns in their data tables with JSON objects. It creates a LookML view file that generates a dimension for each field within a JSON object, and pushes that file into github.',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/leighajarett/JSON_to_LookML',
    title: 'JSON 2 LookML',
  },
  {
    id: 40,
    content:
      'A tool to persist descriptions from your dbt project your lookml project.',
    type: 'example',
    tag: 'devtool',
    link: 'https://github.com/fishtown-analytics/dbtdocs-to-lookml',
    title: 'DBTdocs 2 LookML',
  },
  {
    id: 41,
    content:
      'A speedy LookML parser and serializer implemented in pure Python.',
    type: 'resource',
    tag: 'devtool',
    link: 'https://github.com/joshtemple/lkml',
    title: 'lkml parser',
  },
  {
    id: 42,
    content: "A comprehensive demo of Looker's embedding capabilities",
    type: 'example',
    tag: 'embed',
    link: 'https://atomfashion.io/',
    title: 'Atom Fashion Embed Demo',
  },
  {
    id: 43,
    content: 'An awesome list of awesome Looker projects.',
    type: 'resource',
    tag: 'other',
    link: 'https://github.com/alison985/awesome-looker',
    title: 'Awesome Looker List',
  },
]
