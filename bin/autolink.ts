#!/usr/bin/env node

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

import * as fs from 'fs'
import * as path from 'path'

interface IPackage {
  name: string
  packagePath: string
  references: string[]
  dependencies: string[]
}

type Packages = { [key: string]: IPackage }

const parentPath = (dir: string) => path.resolve(dir, '../')

// Remove the node runner info
const args = process.argv.slice(1)
const root = parentPath(path.dirname(args[0]))
const config = `${root}/tsconfig.json`

const readFile = (fileName: string): string => {
  return fs.readFileSync(fileName, { encoding: 'utf-8' })
}

const findPackageJson = (dir: string) => {
  const name = 'package.json'
  let packageFile = `${dir}/${name}`
  if (!fs.existsSync(packageFile)) {
    packageFile = `${parentPath(dir)}/${name}`
  }

  if (!fs.existsSync(packageFile)) {
    return ''
  }
  return packageFile
}

const readPackageJson = (dir: string) => {
  const packageFile = findPackageJson(dir)
  if (!packageFile || !fs.existsSync(packageFile)) {
    console.error(
      `Could not find ${dir}/package.json or ${parentPath(dir)}/package.json`
    )
    // process.exit(1)
  }

  return JSON.parse(readFile(packageFile))
}

/**
 * Retrieve the primary path of every configured package
 * @param {string} configFile name of config file with package paths
 * @param parentPath parent path
 * @returns {{[p: string]: string[]}}
 */
const loadConfigPackages = (
  configFile: string,
  parentPath: string = root
): Packages => {
  if (!fs.existsSync(configFile)) {
    console.error(`${configFile} not found`)
    process.exit(1)
  }

  const json = JSON.parse(readFile(configFile))
  const result = {}
  Object.entries(json.compilerOptions.paths).forEach(([name, paths]) => {
    const packageJsonFile = findPackageJson(
      `${parentPath}/${(paths as string[])[0]}`
    )
    if (packageJsonFile) {
      const packagePath = path.dirname(packageJsonFile)
      result[name] = {
        dependencies: [],
        name,
        packagePath,
        references: [],
      }
    }
  })
  return result
}

const loadPackageDependencies = (
  data: IPackage,
  packages: Packages
): IPackage => {
  const result = data
  const json = readPackageJson(data.packagePath)
  const deps = json.dependencies ?? {}
  const devDeps = json.devDependencies ?? {}
  Object.entries(deps).forEach(([packageName]) => {
    if (packageName in packages) {
      packages[packageName].references.push(data.name)
      data.dependencies.push(packageName)
    }
  })
  Object.entries(devDeps).forEach(([packageName]) => {
    if (packageName in packages) {
      packages[packageName].references.push(data.name)
      data.dependencies.push(packageName)
    }
  })
  return result
}

const loadDependencies = (
  fileName: string,
  parentPath: string = root
): Packages => {
  const packages = loadConfigPackages(fileName, parentPath)
  Object.entries(packages).forEach(([name, data]) => {
    packages[name] = loadPackageDependencies(data, packages)
  })
  return packages
}

type LinkOption = 'show' | 'link' | 'unlink'

const processLinks = (packages: Packages, op: LinkOption): string[] => {
  const commands: string[] = []

  // do all links or unlinks first
  Object.entries(packages)
    .filter(([, data]) => data.references.length > 0)
    .forEach(([name, data]) => {
      commands.push(
        `# ${op} ${name} referenced by ${data.references.join(', ')}`
      )
      commands.push(`cd ${data.packagePath}`)
      commands.push(`yarn ${op}`)
    })

  // process all package dependencies
  Object.entries(packages)
    .filter(([, data]) => data.dependencies.length > 0)
    .forEach(([name, data]) => {
      commands.push(`# ${op} ${name} uses of ${data.dependencies.join(', ')}`)
      commands.push(`cd ${data.packagePath}`)
      data.dependencies.forEach((dep) => {
        commands.push(`yarn ${op} ${dep}`)
      })
    })
  return commands
}

const dependencies = loadDependencies(config, root)

const op: LinkOption = (args.length > 1
  ? args[1].toLocaleLowerCase()
  : 'show') as LinkOption

switch (op) {
  case 'show':
    console.log(JSON.stringify(dependencies, null, 2))
    break

  case 'link':
  case 'unlink':
    console.log(processLinks(dependencies, op).join('\n'))
    break

  default:
    console.error(`unrecognizaed option "${op}"`)
    break
}
