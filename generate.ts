// Client language SDK code generator
// Copyright (c) 2019 by Looker Data Sciences, Inc. All rights reserved worldwide
// TODO: license?

// NOTE: If you're using an instance that fails SSL verification, you will need to run this process
// with an override for Node to turn off TLS verification. Something like this will work.
// export NODE_TLS_REJECT_UNAUTHORIZED="0" && yarn ts-node generate.ts

import * as fs from 'fs'
import * as path from 'path'
import * as swagger2openapi from 'swagger2openapi'
// import * as openapigenerator from '@openapitools/openapi-generator-cli'
import { TargetLanguages, IGeneratorSpec as ILanguageSpec } from './targetLanguages'
import { ISDKConfigProps, SDKConfig} from './sdkConfig'
import { fetchSpecFile } from './fetchSpec'
import { exec } from 'child_process';

const upgradeSpec = async (fileName: string) => {
  const v3File = fileName.replace('.json', '.v3.json')
  const callback = (err: any, options: any) => {
    fs.writeFileSync(v3File, JSON.stringify(options.openapi, null, 2))
  }

  try {
    await swagger2openapi.convertFile(fileName, {}, callback)
    return v3File
  } catch (e) {
    console.error(e)
  }
}

// TODO create async version of this since it blocks I/O or does it not matter for our generator?
const getAllFiles = (dir: string) => {
    return fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file)
      const isDirectory = fs.statSync(name).isDirectory()
      return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name]
    }, [])
  }

const generate = async (fileName: string, spec: ILanguageSpec, name: string, props: ISDKConfigProps) => {
  const path = spec.path ? spec.path : spec.language
  const apiPath = `./api/${props.api_version}/${path}`
  const cmd = `openapi-generator generate -i ${fileName} -g ${spec.language} -o ${apiPath} --enable-post-process-file ${spec.options}`
  try {
    await exec(cmd)
    return getAllFiles(apiPath)
  } catch(e) {
    console.error(e)
  }
  return []
}

const runConfig = async (name: string, props: ISDKConfigProps) => {
  console.log(`processing ${name} configuration ...`)
  const specFile = await fetchSpecFile(name, props)
  console.log(`${specFile} exists.`)
  const v3File = await upgradeSpec(specFile)
  console.log(`${v3File} upgrade is complete.`)
  TargetLanguages.forEach(async language => {
    const tag = `${language.language} ${name} API version ${props.api_version}`
    console.log(`generating ${tag} ...`)
    await generate(v3File, language, name, props)
    // const files = await generate(v3File, language, name, props)
    // console.log(`${files.length} files generated for ${tag}.`)
  })
}

(async () => {
  try {
    const config = SDKConfig()
    await Object.entries(config).forEach(async ([name, props]) => await runConfig(name, props))
  } catch (e) {
    console.error(e)
  }
})()
