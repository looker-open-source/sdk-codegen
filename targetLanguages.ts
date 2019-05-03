export interface IGeneratorSpec {
  language: string // name of Open API Generator language to produce
  path?: string // if not provided, defaults to the same value as language
  options: string // generator options
}

// To disable generation of any language specification, you can just comment it out
// To add a language, find its name at https://openapi-generator.tech/docs/generators
export const TargetLanguages:Array<IGeneratorSpec> =
[
  // {
  //   language: 'csharp',
  //   options: '-DapiPackage=Looker -DpackageName=looker'
  // },
  // {
  //   language: 'java',
  //   options: '-DinvokerPackage=com.looker.sdk -DmodelPackage=com.looker.sdk.model -DapiPackage=com.looker.sdk.api -DgroupId=com.looker.sdk -DartifactId=looker-sdk -DartifactVersion=0.5.0 -DpackageName=looker'
  // },
  // {
  //   language: 'kotlin',
  //   options: '-DapiPackage=com.looker.sdk -DpackageName=com.looker.sdk'
  // },
  {
    language: 'python',
    options: '-DapiPackage=Looker -DpackageName=looker'
  },
  {
    language: 'r',
    options: '-DapiPackage=Looker -DpackageName=looker'
  },
  // {
  //   language: 'ruby',
  //   options: '-DapiPackage=Looker -DpackageName=looker'
  // },
  // {
  //   language: 'rust',
  //   options: '-DapiPackage=Looker -DpackageName=looker'
  // },
  {
    language: 'typescript-node',
    path: 'ts_node',
    options: '-DapiPackage=Looker -DpackageName=looker'
  },
  {
    language: 'swift4',
    path: 'swift',
    options: '-DapiPackage=Looker -DpackageName=looker'
  },
  // {
  //   language: 'typescript-fetch',
  //   path: 'ts_fetch',
  //   options: '-DapiPackage=looker -DpackageName=looker'
  // },

]
