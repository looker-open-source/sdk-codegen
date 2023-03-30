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

import { ItemList } from './ItemList'
import { initSdk } from './test-utils'

interface Item {
  id: string
  content: string
}

const sdk = initSdk()

const items: Item[] = [
  { id: 'foo', content: 'foo content' },
  { id: 'bar', content: 'bar content' },
]

class TestItemList extends ItemList<Item> {
  items = items
}

describe('ItemList', () => {
  let ItemList: ItemList<Item>

  beforeEach(() => {
    ItemList = new TestItemList(sdk)
  })

  describe('caching', () => {
    it('correctly computes expiration time', () => {
      const frozenDate = Date.now()
      jest.spyOn(global.Date, 'now').mockImplementationOnce(() => frozenDate)
      const expected = frozenDate * 1000 + 900 // the default ttl
      ItemList.setExpiration()
      expect(ItemList.expiresAt).toEqual(expected)
    })

    it('clearIfExpired clears when expired', () => {
      ItemList = new TestItemList(sdk, -100)
      expect(ItemList.items).toHaveLength(2)
      ItemList.clearIfExpired()
      expect(ItemList.items).toHaveLength(0)
    })

    it('clearIfExpired does not clear if still valid', () => {
      ItemList.setExpiration()
      expect(ItemList.items).toHaveLength(2)
      ItemList.clearIfExpired()
      expect(ItemList.items).toHaveLength(2)
      expect(ItemList.items).toEqual(items)
    })
  })

  // describe('indexBy', () => {
  //   it('creates a keyed collection with specified key', () => {
  //     ItemList.indexBy('id')
  //     const actual = ItemList.itemMap
  //     expect(actual).toEqual({
  //       foo: items[0],
  //       bar: items[1],
  //     })
  //   })
  // })
})
