/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import type { ITheme } from '@looker/sdk'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { theme, all_themes, default_theme } from '@looker/sdk'

// interface IItem {
//   id: string
// }

function arrayToCollection(arr: Array<ITheme>): Record<string, ITheme> {
  const collection: Record<string, ITheme> = {}
  for (const item of arr) {
    const key = item?.id
    if (key) {
      collection[key] = item
    }
  }
  return collection
}

type ThemeEvent = (theme: ITheme) => void

export class Themes {
  collection: Record<string, ITheme>
  sdk: IAPIMethods
  observers: ThemeEvent[] = []

  //
  constructor(sdk: IAPIMethods) {
    this.collection = {}
    this.sdk = sdk
  }

  async get(id: string, fields: string, cache = true) {
    if (!cache && !this.collection[id]) {
      const item = await this.sdk.ok(theme(this.sdk, id, fields))
      if (item?.id) {
        this.collection[item.id] = item
      }
    }
    return this.collection[id]
  }

  async getAll() {
    const items = await this.sdk.ok(all_themes(this.sdk))
    this.collection = arrayToCollection(items)
    return this.collection
  }

  async getDefault() {
    const defaultTheme = await this.sdk.ok(default_theme(this.sdk))
    return defaultTheme
  }

  embedUrl(theme?: string) {
    let overrides = ''
    if (theme && theme !== 'Looker') {
      overrides += `?theme=${theme}`
    }
    return `${window.location.origin}/embed${window.location.pathname}${overrides}`
  }

  // activate<T>(name: string | T) {
  // step 1: set active theme
  // step 2: call eache observer with active theme
  // look into pub sub systems
  // maybe use the observer pattern? themeService.observe() after creating theme service
  // (theme) => void
  // }
}
