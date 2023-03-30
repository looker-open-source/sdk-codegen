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
import {
  all_themes,
  default_theme,
  delete_theme,
  theme,
  update_theme,
} from '@looker/sdk'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { ItemList } from './ItemList'
import type { IEntityService, IItemList } from './ItemList'
import type { ServiceCreatorFunc } from './ServiceFactory'

export interface IThemeService
  extends IItemList<ITheme>,
    IEntityService<ITheme> {
  defaultTheme?: ITheme
  getDefaultTheme(ts?: Date): Promise<ITheme>
}

// todo: check if 'final' is available in this TS version
class ThemeService extends ItemList<ITheme> implements IThemeService {
  public defaultTheme?: ITheme

  async get(
    id: string,
    cache: boolean,
    fields: string
  ): Promise<Partial<ITheme>> {
    let item = this.indexedItems[id]

    if (cache && item) {
      return item
    }

    item = await this.sdk.ok(theme(this.sdk, id, fields))

    if (item?.id) {
      this.items[item.id] = item
    }
    return item
  }

  async getAll(fields: string) {
    this.items = await this.sdk.ok(all_themes(this.sdk, fields))
    // update index
    return this
  }

  async set(id: string, item: ITheme) {
    return await this.sdk.ok(update_theme(this.sdk, id, item))
    // update index
  }

  async getDefaultTheme(ts?: Date) {
    this.defaultTheme = await this.sdk.ok(default_theme(this.sdk, ts))
    return this.defaultTheme
  }

  async delete(id: string) {
    await this.sdk.ok(delete_theme(this.sdk, id))
  }
}

export const THEME_SERVICE_NAME = 'ThemeService'
// TODO: make timeToLive changeable via a setter in ItemList
export const themeServiceCreator: ServiceCreatorFunc = (sdk: IAPIMethods) => {
  return new ThemeService(sdk)
}
