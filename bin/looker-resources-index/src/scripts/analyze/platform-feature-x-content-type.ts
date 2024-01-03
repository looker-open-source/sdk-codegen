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
import type { Resource } from '../../types';
import { PlatformFeature, ContentType } from '../../types';

export function platformFeatureXContentType(resources: Resource[]) {
  const rows = Object.keys(PlatformFeature) as PlatformFeature[];
  const rowField = 'platformFeatures';
  const cols = [
    ContentType.demo,
    ContentType.sandbox,
    ContentType.sampleCode,
    ContentType.reference,
  ];
  const colField = 'contentTypes';

  const table = Object.fromEntries(
    rows.map(row => {
      const resourcesForRow = resources.filter(
        rsc => rsc[rowField]?.includes(row)
      );
      return [
        row,
        Object.fromEntries(
          cols.map(col => [
            col,
            resourcesForRow.filter(rsc => rsc[colField]?.includes(col))
              .length || null,
          ])
        ),
      ];
    })
  );

  return {
    table,
  };
}
