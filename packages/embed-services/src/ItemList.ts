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

import type { IAPIMethods } from '@looker/sdk-rtl/lib/apiMethods'
import { EntityService } from './EntityService'
import type { IService } from './ServiceFactory'

export interface IItemList<T> {
  /** Cache lifetime in seconds. Defaults to 10 minutes */
  readonly timeToLive: number
  keyField: keyof T
  items: T[]
  expiresAt: number
  indexedItems: Record<string, T>
  index(key: keyof T): ItemList<T>
  setExpiration(): void
  clearIfExpired(): void
}

export interface IEntityService<T> extends IItemList<T>, IService {
  get(id: string, cache: boolean, ...options: any[]): Promise<T>
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

  constructor(
    sdk: IAPIMethods,
    readonly timeToLive: number = 900
    // I WOULD NOT PASS keyField IN THE CONSTRUCTOR
    // public keyField: keyof T = 'id'
  ) {
    super(sdk)
  }

  /**
   * Creates an indexed collection from the cached items
   */
  // I WOULD PASS THE keyField IN HERE. If you pass the index in here
  // you can have multiple indexes.
  index(index = 'id') {
    this.indexedItems = {}
    this.items.forEach((el) => {
      if (el && el?.[this.keyField]) {
        this.indexedItems[el[this.keyField]] = el
      }
    })
    return this
  }

  /** Computes the expiration time based on timeToLive */
  // MAKE PROTECTED?
  setExpiration() {
    this.expiresAt = Date.now() * 1000 + this.timeToLive
  }

  /**
   * Determines if the cache has expired
   */
  protected expired() {
    return this.expiresAt <= Date.now() * 1000
  }

  /**
   * Ejects cache if expired
   */
  // WHAT CALLS THIS?
  clearIfExpired() {
    if (this.expired()) {
      this.items = []
      this.indexedItems = {}
    }
  }
}
