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
  useCache?: boolean
  [key: string]: any
}

export interface IItemList<T> {
  /** Cache time to live in seconds, defaults to 15 minutes */
  readonly timeToLive: number
  /** Cached items */
  items: T[]
  /** Expiration time */
  readonly expiresAt: number
  /** Creates an indexed collection from the cached items */
  index(key?: keyof T): ItemList<T>
  /** An indexed collection of items */
  indexedItems: Record<string, T>
  /** Determines if the cache has expired */
  expired(): boolean
  /** Computes the expiration time based on timeToLive */
  setExpiration(): void
  /** Ejects cache if expired */
  clearIfExpired(): void
  /**
   * Searches the collection for an item with the specified key/value pair
   * @param key or keys to search
   * @param expression to match
   */
  find(key: keyof T | Array<keyof T>, value: any): T | undefined
  /**
   * Gets the cache option value if present, otherwise defaults to true
   * @param options to check
   */
  getCacheDefault(options?: GetOptions): boolean
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
  items: T[] = []
  indexedItems: Record<string, T> = {}
  expiresAt = 0
  /** Key to index by */
  private keyField = 'id'

  constructor(sdk: IAPIMethods, timeToLive = DEFAULT_TTL) {
    super(sdk, timeToLive)
  }

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

  setExpiration() {
    this.expiresAt = Date.now() + this.timeToLive * 1000
  }

  expired() {
    return this.expiresAt <= Date.now()
  }

  clearIfExpired() {
    if (this.expired()) {
      this.items = []
      this.indexedItems = {}
    }
  }

  find(key: keyof T | Array<keyof T>, expression: string): T | undefined {
    let result: T | undefined
    let keys: Array<keyof T>

    if (typeof key === 'string') {
      keys = [key]
    } else {
      keys = key as Array<keyof T>
    }

    try {
      const rx = new RegExp(expression, 'i')

      for (const item of this.items) {
        for (const k of keys) {
          const match = item[k]?.toString().match(rx)
          if (match) {
            result = item as T
            return result
          }
        }
      }
      return result
    } catch (e: any) {
      throw new Error(e)
    }
  }

  getCacheDefault(options?: GetOptions) {
    const cache =
      options && 'useCache' in options && options.useCache !== undefined
        ? options.useCache
        : true
    return cache
  }
}
