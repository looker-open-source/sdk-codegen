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
import { ContentType } from '../../types';

export function missingLanguages(resources: Resource[]) {
  const isTargetContentType = (c: ContentType) =>
    [
      ContentType.sampleCode,
      ContentType.sourceCode,
      ContentType.template,
      ContentType.library,
    ].includes(c);

  const resourcesRequiringLanguages = resources.filter(
    (r) => r.contentTypes?.some(isTargetContentType)
  );

  const resourcesMissingLanguages = resourcesRequiringLanguages.filter(
    (r) => !r.languages || r.languages.length === 0
  );

  return {
    summary:
      resourcesMissingLanguages.length === 0
        ? `✅\tAll ${resourcesRequiringLanguages.length} resources that should have a language have one`
        : `⚠️\t${resourcesMissingLanguages.length} of ${resourcesRequiringLanguages.length} resources that should have a language are missing them`,
    actionItems: resourcesMissingLanguages.map(
      (r) =>
        `No languages declared, with a contentType '${r.contentTypes.find(
          isTargetContentType
        )}'\tResource ID: ${r.id}`
    ),
  };
}
