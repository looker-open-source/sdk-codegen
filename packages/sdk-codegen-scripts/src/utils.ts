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
import {
  ApiModel,
  codeGenerators,
  findGenerator,
  getSpecsFromVersions,
  ILookerVersions,
  SpecItem,
  upgradeSpecObject,
} from '@looker/sdk-codegen'
import { log } from '@looker/sdk-codegen-utils'
import { readFileSync } from './nodeUtils'
import { ISDKConfigProps, SDKConfig } from './sdkConfig'
import {
  authGetUrl,
  fetchLookerVersion,
  fetchLookerVersions,
  logConvertSpec,
} from './fetchSpec'
import { specFromFile } from './sdkGenerator'

export const apiVersions = (props: any) => {
  const versions = props.api_versions ?? '3.1,4.0'
  return versions.split(',')
}

export interface IGenProps {
  /** Languages to generate */
  languages: string[]
  /** name of first INI config section, used for package name */
  name: string
  /** SDK config properties from the first section */
  props: ISDKConfigProps
  /** api specifications */
  lookerVersions: ILookerVersions
  /** Release version */
  lookerVersion: string
  /** Api version collection */
  apis: string[]
  /** Last API version */
  lastApi: string
}

const generatorHelp = () => {
  log(`sdkGen [languages...] [-v|--versions <versions file>] [-h|--help]`)
  process.exit(0)
}

/**
 * Process command-line switches for versions payload and languages
 * @param args
 */
export const doArgs = (args: string[]) => {
  let versions: ILookerVersions | undefined

  const langs: string[] = []
  if (args.length > 0 && args.toString().toLowerCase() !== 'all') {
    let i = 0
    while (i < args.length) {
      const arg = args[i].toLowerCase()
      switch (arg) {
        case '-v':
        case '--versions':
          {
            i++
            const content = readFileSync(args[i], 'utf8')
            versions = JSON.parse(content)
          }
          break
        case '-h':
        case '--help':
          generatorHelp()
          break
        default:
          {
            const values = arg.split(',').filter((v) => v.trim())
            values.forEach((v) => {
              const gen = findGenerator(v.trim())
              if (gen) {
                // Valid language match
                langs.push(gen.language)
              }
            })
          }
          break
      }
      i++
    }
  }

  // Default languages to all
  const languages = (langs.length > 0
    ? langs
    : codeGenerators
        .filter((l) => l.factory !== undefined)
        .map((l) => l.language)
  ).filter((value, index, all) => all.indexOf(value) === index)

  return { languages, versions }
}

/**
 * Load the default configuration settings from looker.ini
 */
export const loadConfig = () => {
  const config = SDKConfig()
  const [name, props] = Object.entries(config)[0]
  return { name, props }
}

/**
 * Prepare the generator configuration from all configuration options and return the config
 * @param args command-line style arguments to parse.
 */
export const prepGen = async (args: string[]): Promise<IGenProps> => {
  const { languages, versions } = doArgs(args)
  const { name, props } = loadConfig()
  let lookerVersions
  let lookerVersion = ''
  try {
    lookerVersions = versions || (await fetchLookerVersions(props))
    lookerVersion = await fetchLookerVersion(props, lookerVersions)
  } catch {
    // Looker server may not be required, so default things for the generator
    lookerVersions = {
      supported_versions: [
        {
          version: '3.1',
          status: 'stable',
          full_version: '',
          swagger_url: `https://${props.base_url}/api/3.1/swagger.json`,
        },
        {
          version: '4.0',
          status: 'experimental',
          full_version: '',
          swagger_url: `https://${props.base_url}/api/4.0/swagger.json`,
        },
      ],
    }
    lookerVersion = ''
  }
  // Iterate through all specified API versions
  const apis = apiVersions(props)
  const lastApi = apis[apis.length - 1]

  const result = {
    name,
    props,
    languages,
    lookerVersions: lookerVersions as ILookerVersions,
    lookerVersion,
    apis,
    lastApi,
  }
  console.log(JSON.stringify(result, null, 2))
  return result
}

/**
 * Load and save specifications from the versions file
 * @param config generation configuration properties
 * @param fetch false to skip fetching the spec, true to fetch. Defaults to true
 */
export const loadSpecs = async (config: IGenProps, fetch = true) => {
  const specFetch = async (spec: SpecItem) => {
    if (!fetch) return undefined
    if (!spec.specURL) return undefined
    const content = await authGetUrl(config.props, spec.specURL)
    const api = ApiModel.fromJson(content)
    return api
  }

  const p = { ...config.props }

  const specs = await getSpecsFromVersions(config.lookerVersions, specFetch)
  // TODO Code smell? Reaching in and updating the api versions collection
  config.apis = Object.keys(specs)
  if (fetch) {
    for (const api of config.apis) {
      const spec = specs[api]
      if (!spec.specURL) {
        continue
      }
      const url = new URL(spec.specURL)
      if (url.protocol === 'file:') {
        // Working off local file specifications
        const content = readFileSync(url.pathname)
        const json = JSON.parse(content)
        spec.api = ApiModel.fromJson(upgradeSpecObject(json))
      } else {
        p.api_version = api
        const oasFile = await logConvertSpec(
          config.name,
          p,
          config.lookerVersions
        )
        spec.api = specFromFile(oasFile)
      }
    }
  }

  return specs
}
