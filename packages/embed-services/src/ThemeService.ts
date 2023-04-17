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
import type { IEntityService, IItemList, GetOptions } from './ItemList'
import type { ServiceCreatorFunc } from './ServiceFactory'
import { getFactory } from './ServiceFactory'

export interface IThemeService
  extends IItemList<ITheme>,
    IEntityService<ITheme> {
  defaultTheme?: ITheme
  getDefaultTheme(ts?: Date, options?: GetOptions): Promise<ITheme>
  load(options?: GetOptions): Promise<IThemeService>
}

class ThemeService extends ItemList<ITheme> implements IThemeService {
  public defaultTheme?: ITheme

  /**
   * Get theme by id
   * @param id of theme to retrieve
   * @param options to get
   */
  async get(id: string, options?: GetOptions): Promise<Partial<ITheme>> {
    // TODO: implement logic to check if requested fields are already cached.
    const cache = this.getCacheDefault(options)
    this.clearIfExpired()
    let item = this.indexedItems[id]

    if (cache && item) {
      return item
    }

    item = await this.sdk.ok(theme(this.sdk, id, options?.fields))

    if (item) {
      this.items = [...this.items, item]
      this.index()
      this.setExpiration()
    }
    return item
  }

  /**
   * Get all themes, including the default theme
   * @param options to get
   */
  async getAll(options?: GetOptions) {
    if (this.getCacheDefault(options) && !this.expired()) {
      return this
    }
    await this.load(options)
    return this
  }

  /**
   * Updates a theme
   * @param id id of theme to update
   * @param item with updated fields
   */
  async set(id: string, item: ITheme) {
    this.clearIfExpired()
    const theme = await this.sdk.ok(update_theme(this.sdk, id, item))
    if (theme) {
      this.items = [...this.items, theme]
      this.index()
      this.setExpiration()
    }
    return theme
  }

  /**
   * Gets the default theme
   * @param ts Timestamp representing the target datetime for the active period. Defaults to 'now'
   */
  async getDefaultTheme(ts?: Date) {
    if (this.expired()) {
      this.defaultTheme = await this.sdk.ok(default_theme(this.sdk, ts))
    }
    return this.defaultTheme as ITheme
  }

  /**
   * Deletes a theme
   * @param id of theme to delete
   */
  async delete(id: string) {
    this.clearIfExpired()
    await this.sdk.ok(delete_theme(this.sdk, id))
    this.items = this.items.filter((item) => item.id !== id)
    this.index()
  }

  /**
   * Retrieves all themes and the default theme
   */
  async load(options?: GetOptions) {
    await this.getDefaultTheme()
    this.items = await this.sdk.ok(all_themes(this.sdk, options?.fields))
    this.index()
    this.setExpiration()
    return this
  }
}

export const THEME_SERVICE_NAME = 'ThemeService'

/**
 * A theme service creator helper function
 * @param sdk
 * @param timeToLive  in seconds for the cache
 */
export const themeServiceCreator: ServiceCreatorFunc<IThemeService> = (
  sdk: IAPIMethods,
  timeToLive?: number
) => {
  return new ThemeService(sdk, timeToLive)
}

/**
 * Creates and registers the theme service with the service factory
 * @param timeToLive  in seconds for the cache
 */
export const registerThemeService = (timeToLive?: number) => {
  getFactory().register(THEME_SERVICE_NAME, themeServiceCreator, timeToLive)
}

/**
 * Gets the theme service registered with the service factory
 */
export const getThemeService = () =>
  getFactory().get<IThemeService>(THEME_SERVICE_NAME)
