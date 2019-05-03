// Client language SDK code generator
// Copyright (c) 2019 by Looker Data Sciences, Inc. All rights reserved worldwide
// TODO: license?

// NOTE: If you're using an instance that fails SSL verification, you will need to run this process
// with an override for Node to turn off TLS verification. Something like this will work:
// export NODE_TLS_REJECT_UNAUTHORIZED="0" && yarn ts-node generate.ts

import * as fs from 'fs'
import * as path from 'path'
import * as swagger2openapi from 'swagger2openapi'
// import { promisify } from 'util'
// import * as speccy from 'speccy/lib/loader'
import { TargetLanguages, IGeneratorSpec as ILanguageSpec } from './targetLanguages'
import { ISDKConfigProps, SDKConfig} from './sdkConfig'
import { fetchSpecFile } from './fetchSpec'
import { execSync } from 'child_process'

const quit = (err: Error) => {
  console.error(`Error: ${err.name}, ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

const lintCheck = async (fileName: string) => {
  // TODO skip if flag to ignore lint errors is specified
  try {
    const linter = await execSync(`speccy lint ${fileName}`)
    return linter
    // const options = {
    //   resolve: false,   // Resolve external references
    //   jsonSchema: false // Treat $ref like JSON Schema and convert to OpenAPI Schema Objects
    // }
    // speccy
    //   .loadSpec(openApiFile, options)            // Load the spec...
    //   .then(spec => console.log(JSON.stringify(spec))); // ...and print it out.
  } catch(e) {
    quit(e)
  }
}

const upgradeSpec = async (fileName: string) => {
  const openApiFile = fileName.replace('.json', '.oas.json')
  const callback = (err: any, options: any) => {
    fs.writeFileSync(openApiFile, JSON.stringify(options.openapi, null, 2))
  }

  try {
    await swagger2openapi.convertFile(fileName, {}, callback)
    return openApiFile
  } catch (e) {
    quit(e)
  }
}

// Abstraction of log so it can be skipped when quiet mode is enabled
const log = (message?: any, ...optionalParams: any) => console.log(message, optionalParams)

// TODO create async version of this since it blocks I/O or does it not matter for our generator?
const getAllFiles = (dir: string) => {
    return fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file)
      const isDirectory = fs.statSync(name).isDirectory()
      return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name]
    }, [])
  }

// perform the generation for specific API version, configuration, and language
const generate = async (fileName: string, spec: ILanguageSpec, name: string, props: ISDKConfigProps) => {
  const path = spec.path ? spec.path : spec.language
  const apiPath = `./api/${props.api_version}/${path}`
  const cmd = `openapi-generator generate -i ${fileName} -g ${spec.language} -o ${apiPath} --enable-post-process-file ${spec.options}`
  try {
    const generator = await execSync(cmd)
    console.log({generator})
    return getAllFiles(apiPath)
  } catch(e) {
    quit(e)
  }
  return []
}

// generate all languages for the specified configuration
const runConfig = async (name: string, props: ISDKConfigProps) => {
  log(`processing ${name} configuration ...`)
  const specFile = await fetchSpecFile(name, props)
  log(`${specFile} exists.`)
  const openApiFile = await upgradeSpec(specFile)
  log(`${openApiFile} upgrade is complete.`)
  const linter = await lintCheck(openApiFile)
  log('lint check complete')
  TargetLanguages.forEach(async language => {
    const tag = `${language.language} ${name} API version ${props.api_version}`
    log(`generating ${tag} ...`)
    await generate(openApiFile, language, name, props)
    // const files = await generate(v3File, language, name, props)
    // console.log(`${files.length} files generated for ${tag}.`)
  })
}

(async () => {
  try {
    const config = SDKConfig()
    await Object.entries(config).forEach(async ([name, props]) => await runConfig(name, props))
  } catch (e) {
    quit(e)
  }
})()
