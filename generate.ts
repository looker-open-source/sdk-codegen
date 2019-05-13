#!/usr/bin/env node

// Client language SDK code generator
// Copyright (c) 2019 by Looker Data Sciences, Inc. All rights reserved worldwide
// TODO: license?

// NOTE: If you're using a Looker instance that fails SSL verification, you will need to run this process
// with an override for Node to turn off TLS verification. Something like this will work:
// export NODE_TLS_REJECT_UNAUTHORIZED="0" && yarn generate

import * as fs from 'fs';
import { TargetLanguages, GeneratorSpec as LanguageSpec } from './targetLanguages'
import { SDKConfigProps, SDKConfig} from './sdkConfig'
import { fetchSpecFile } from './fetchSpec'
import { execSync } from 'child_process'

const quit = (err: Error) => {
  console.error(`Error: ${err.name}, ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

const fail = (name: string, message: string) => {
  const err = new Error(message)
  err.name = name
  quit(err)
}

const run = async (command: string, args: string[]) => {
  // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
  const options = {
    maxBuffer: 1024 * 2048,
    timeout: 300 * 1000,
    windowsHide: true,
    encoding: 'utf8',
  }
  try {
    // const result = await spawnSync(command, args, options)
    command += ' ' + args.join(' ')
    const result = execSync(command, options)
    return result
  } catch (e) {    
    return quit(e)
  }
}

const lintCheck = async (fileName: string) => {
  // TODO skip if flag to ignore lint errors is specified
  try {
    const linter = await run('speccy', ['lint', fileName])
    if (!linter) return fail('Lint', 'no response')
    if (linter.indexOf('Specification is valid, with 0 lint errors') >= 0) return
    return fail('Lint', linter.toString())
  } catch(e) {
    return quit(e)
  }

}

const upgradeSpec = async (fileName: string) => {
  const openApiFile = fileName.replace('.json', '.oas.json')

  try {
    // https://github.com/Mermade/oas-kit/tree/master/packages/swagger2openapi config options:
    // patch to fix up small errors in source definition (not required, just to ensure smooth process)
    // indent 2 spaces
    // output to openApiFile
    await run('swagger2openapi', [fileName, '-p', '-i', '"  "', '-o', openApiFile])
    if (!fs.existsSync(openApiFile)) return fail('Upgrade', `creating ${openApiFile} failed`)
    return openApiFile
  } catch (e) {
    return quit(e)
  }
}

// Abstraction of log so it can be skipped when quiet mode is enabled
const log = (message?: any) => console.log(message)

// perform the generation for specific API version, configuration, and language
const generate = async (fileName: string, spec: LanguageSpec, props: SDKConfigProps) => {
  const path = spec.path ? spec.path : spec.language
  const apiPath = `./api/${props.api_version}/${path}`
  return run('openapi-generator',
    ['generate','-i', fileName, '-g', spec.language, '-o', apiPath, '--enable-post-process-file', spec.options])
}

// generate all languages for the specified configuration
const runConfig = async (name: string, props: SDKConfigProps) => {
  let results: any[] = []
  log(`processing ${name} configuration ...`)

  const specFile = await fetchSpecFile(name, props)
  if (!specFile) return fail('fetchSpecFile', 'No specification file name returned')
  log(`${specFile} exists.`)

  const openApiFile = await upgradeSpec(specFile)
  if (!openApiFile) return fail('upgradeSpec', 'No file name returned for openAPI upgrade')
  log(`${openApiFile} upgrade is complete.`)

  await lintCheck(openApiFile)
  log(`${openApiFile} lint check passed.`)

  TargetLanguages.forEach(async language => {
    const tag = `${name} API ${language.language} version ${props.api_version}`
    log(`generating ${tag} ...`)
    results.push(await generate(openApiFile, language, props))
  })

  return results
}

  try {
    const config = SDKConfig()
    Object.entries(config).forEach(async ([name, props]) => runConfig(name, props))
  } catch (e) {
    quit(e)
  }
