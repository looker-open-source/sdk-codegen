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

import type { IAPIMethods } from '@looker/sdk-rtl';
import { DEFAULT_TTL, ItemList } from './ItemList';

interface TestItem {
  id: string;
  name: string;
  content: string;
}

const mockSdk = {} as IAPIMethods;

const items: TestItem[] = [
  { id: 'foo', name: 'fooName', content: 'foo content' },
  { id: 'bar', name: 'barName', content: 'bar content' },
];

class TestItemList extends ItemList<TestItem> {
  items = items;
}

describe('ItemList', () => {
  let ItemList: ItemList<TestItem>;

  beforeEach(() => {
    ItemList = new TestItemList(mockSdk);
  });

  describe('indexBy', () => {
    it('creates a keyed collection indexed by "id" by default', () => {
      ItemList.index();
      const actual = ItemList.indexedItems;
      expect(actual).toEqual({
        foo: items[0],
        bar: items[1],
      });
    });

    it('creates a keyed collection by specified id', () => {
      ItemList.index('name');
      const expected = {
        fooName: items[0],
        barName: items[1],
      };
      const actual = ItemList.indexedItems;
      expect(actual).toEqual(expected);

      // remembers specified index on re index
      ItemList.index();
      expect(actual).toEqual(expected);
    });
  });

  describe('caching', () => {
    let now: number;

    beforeEach(() => {
      now = Date.now();
      jest.spyOn(global.Date, 'now').mockImplementationOnce(() => now);
    });

    it('correctly computes expiration time', () => {
      const expected = now + DEFAULT_TTL * 1000;
      ItemList.setExpiration();
      expect(ItemList.expiresAt).toEqual(expected);
    });

    it('accepts a custom ttl', () => {
      const customTtl = 3600;
      ItemList = new TestItemList(mockSdk, customTtl);
      ItemList.setExpiration();
      const expected = now + customTtl * 1000;
      expect(ItemList.expiresAt).toEqual(expected);
    });

    it('clearIfExpired clears when expired', () => {
      ItemList = new TestItemList(mockSdk, -100);
      expect(ItemList.items).toHaveLength(2);
      ItemList.clearIfExpired();
      expect(ItemList.items).toHaveLength(0);
    });

    it('clearIfExpired does not clear if still valid', () => {
      ItemList.setExpiration();
      expect(ItemList.items).toHaveLength(2);
      ItemList.clearIfExpired();
      expect(ItemList.items).toHaveLength(2);
      expect(ItemList.items).toEqual(items);
    });
  });

  describe('find', () => {
    it('finds by key and value', () => {
      const actual = ItemList.find('id', 'foo');
      expect(actual).toEqual(items[0]);
    });

    it('returns undefined if item not found', () => {
      const actual = ItemList.find('name', 'bogus');
      expect(actual).toBeUndefined();

      expect(ItemList.find('name', 'barName')).toEqual(items[1]);
    });

    it('can search for a value in multiple keys', () => {
      const actual = ItemList.find(['id', 'name'], 'fooName');
      expect(actual).toBe(items[0]);
    });

    it('correctly parses an expression', () => {
      const actual = ItemList.find('id', 'foo|qux');
      expect(actual).toBe(items[0]);
    });
  });

  describe('getCacheDefault', () => {
    it('gets the default', () => {
      let actual = ItemList.getCacheDefault();
      expect(actual).toBe(true);

      actual = ItemList.getCacheDefault({ useCache: undefined });
      expect(actual).toBe(true);
    });

    it('gets value from itemCache option when specified', () => {
      const actual = ItemList.getCacheDefault({ useCache: false });
      expect(actual).toBe(false);
    });
  });
});
