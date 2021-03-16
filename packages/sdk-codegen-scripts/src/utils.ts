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
import fs from 'fs'
import { codeGenerators, ICodeGen, ILookerVersions } from '@looker/sdk-codegen'
import { log } from '@looker/sdk-codegen-utils'
import { isDirSync, readFileSync } from './nodeUtils'
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import { fetchLookerVersion, fetchLookerVersions } from './fetchSpec'

export const apiVersions = (props: any) => {
  const versions = props.api_versions ?? '3.1,4.0'
  return versions.split(',')
}

/**
 * Ensures the existence of the sdk generation path
 * @param gen the SDK source code path
 */
export const sdkPathPrep = (gen: ICodeGen) => {
  const path = `${gen.codePath}${gen.packagePath}/sdk/${gen.apiVersion}`
  if (!isDirSync(path)) fs.mkdirSync(path, { recursive: true })
  return path
}

export interface IPrepGen {
  /** Languages to generate */
  languages: string[]
  /** name of first INI config section, used for package name */
  name: string
  /** SDK config properties from the first section */
  props: ISDKConfigProps
  /** api specifications */
  lookerVersions: any
  /** Release version */
  lookerVersion: string
  /** Api version collection */
  apis: string[]
  /** Last API version */
  lastApi: string
}

const generatorHelp = () => {
  log(`sdkGen [languages...] -v|--versions <versions file> -h|--help`)
  process.exit(0)
}

// const foo = {
//   looker_release_version: '21.0.25',
//   current_version: {
//     version: '3.1',
//     full_version: '3.1.0',
//     status: 'current',
//     swagger_url: 'https://hack.looker.com:19999/api/3.1/swagger.json',
//   },
//   supported_versions: [
//     {
//       version: '2.99',
//       full_version: '2.99.0',
//       status: 'internal_test',
//       swagger_url: 'https://hack.looker.com:19999/api/2.99/swagger.json',
//     },
//     {
//       version: '3.0',
//       full_version: '3.0.0',
//       status: 'legacy',
//       swagger_url: 'https://hack.looker.com:19999/api/3.0/swagger.json',
//     },
//     {
//       version: '3.1',
//       full_version: '3.1.0',
//       status: 'current',
//       swagger_url: 'https://hack.looker.com:19999/api/3.1/swagger.json',
//     },
//     {
//       version: '4.0',
//       full_version: '4.0.21.0',
//       status: 'experimental',
//       swagger_url: 'https://hack.looker.com:19999/api/4.0/swagger.json',
//     },
//   ],
//   api_server_url: 'https://hack.looker.com:19999',
// }

/**
 * Process command-line switches for versions payload and languages
 * @param args
 */
export const doArgs = (args: string[]) => {
  let languages = codeGenerators
    .filter((l) => l.factory !== undefined)
    .map((l) => l.language)
  let versions: ILookerVersions | undefined
  if (args.toString().toLowerCase() !== 'all') {
    languages = []
    let i = 0
    while (i < args.length) {
      const arg = args[i].toLowerCase()
      switch (arg) {
        case '-v':
        case '--versions':
          i++
          versions = JSON.parse(readFileSync(args[i]))
          break
        case '-h':
        case '--help':
          generatorHelp()
          break
        default:
          {
            const values = arg.split(',').filter((v) => v.trim())
            values.forEach((v) => languages.push(v.trim()))
          }
          break
      }
      i++
    }
  }
  return { languages, versions }
}

export const loadConfig = () => {
  const config = SDKConfig()
  const [name, props] = Object.entries(config)[0]
  return { name, props }
}

/**
 * Prepare the generator configuration from all configuration options and return the config
 */
export const prepGen = async (): Promise<IPrepGen> => {
  const args = process.argv.slice(2)
  const { languages, versions } = doArgs(args)
  const { name, props } = loadConfig()
  let lookerVersions = {}
  let lookerVersion = ''
  try {
    lookerVersions = versions ? await fetchLookerVersions(props) : versions
    lookerVersion = await fetchLookerVersion(props, lookerVersions)
  } catch {
    // Looker server may not be required, so default things for the generator
    lookerVersions = {
      supported_versions: [
        {
          version: '3.1',
          swagger_url: `https://${props.base_url}/api/3.1/swagger.json`,
        },
        {
          version: '4.0',
          swagger_url: `https://${props.base_url}/api/4.0/swagger.json`,
        },
      ],
    }
    lookerVersion = ''
  }
  // Iterate through all specified API versions
  const apis = apiVersions(props)
  const lastApi = apis[apis.length - 1]

  return {
    name,
    props,
    languages,
    lookerVersions,
    lookerVersion,
    apis,
    lastApi,
  }
}
