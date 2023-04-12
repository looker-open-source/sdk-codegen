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

import type { IAPIMethods } from '@looker/sdk-rtl'
import { EntityService } from './EntityService'

export const DEFAULT_TTL = 900 // 15 minutes

export interface GetOptions {
  itemCache?: boolean
  [key: string]: any
}

export interface IItemList<T> {
  /** Cache time to live in seconds, defaults to 15 minutes */
  readonly timeToLive: number
  items: T[]
  readonly expiresAt: number
  index(key?: keyof T): ItemList<T>
  indexedItems: Record<string, T>
  setExpiration(): void
  clearIfExpired(): void
  find(key: keyof T, value: any): T | undefined
}

export interface IEntityService<T> extends IItemList<T> {
  get(id: string, options?: GetOptions): Promise<T>
  set(id: string, item: T): Promise<T>
  getAll(...options: any[]): Promise<IItemList<T>>
  delete(id: string): void
}

export abstract class ItemList<T extends Record<string, any>>
  extends EntityService
  implements IItemList<T>
{
  /** Cached items */
  items: T[] = []
  /** An indexed collection of items */
  indexedItems: Record<string, T> = {}
  /** Time when cache expires */
  expiresAt = 0
  /** Key to index by */
  private keyField = 'id'

  constructor(sdk: IAPIMethods, timeToLive = DEFAULT_TTL) {
    super(sdk, timeToLive)
  }

  /**
   * Creates an indexed collection from the cached items
   */
  index(key: keyof T = this.keyField) {
    this.keyField = key as string
    this.indexedItems = {}
    this.items.forEach((el) => {
      if (el && el?.[this.keyField]) {
        this.indexedItems[el[this.keyField]] = el
      }
    })
    return this
  }

  /** Computes the expiration time based on timeToLive */
  setExpiration() {
    this.expiresAt = Date.now() + this.timeToLive * 1000
  }

  /**
   * Determines if the cache has expired
   */
  protected expired() {
    return this.expiresAt <= Date.now()
  }

  /**
   * Ejects cache if expired
   */
  clearIfExpired() {
    if (this.expired()) {
      this.items = []
      this.indexedItems = {}
    }
  }

  /**
   * Searches the collection for an item with the specified key/value pair
   * @param key to search
   * @param value to match
   */
  find<T>(key: keyof T, value: any): T | undefined {
    return this.items.find((item) => item[key as string] === value) as
      | T
      | undefined
  }

  /**
   * Gets the cache option value if present, otherwise defaults to true
   * @param options to check
   */
  getCacheDefault(options?: GetOptions) {
    const cache = options && 'itemCache' in options ? options.itemCache : true
    return cache
  }
}
