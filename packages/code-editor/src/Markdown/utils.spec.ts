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
import {
  addCodeLanguageTags,
  getCodeLanguageFromTaggedText,
  qualifyMarkdownText,
  removeCodeLanguageTags,
} from './utils';

export const toMdString = (textLines: string[]) => textLines.join('\n');

describe('Markdown utils', () => {
  const example = [
    '# Run the query that is specified inline in the posted body.',
    'This allows running a query as defined in json in the posted body. This combines the two actions of posting & running a query into one step.',
    'Here is an example body in json:',
    '```',
    '{',
    '  "model":"thelook",',
    '  "view":"inventory_items",',
    '  "filters":{"category.name":"socks"},',
    '  "sorts":["products.count desc 0"],',
    '  "limit":"500",',
    '  "query_timezone":"America/Los_Angeles"',
    '}',
    '```',
    '',
  ];
  describe('search highlighting', () => {
    const str = toMdString(example.slice(0, 2));
    test('it returns original string when there are no matches', () => {
      const result = qualifyMarkdownText(str, 'dashboard');
      expect(result).toEqual(str);
    });

    test('it returns original string when no pattern is provided', () => {
      const result = qualifyMarkdownText(str, '');
      expect(result).toEqual(str);
    });

    test('it wraps matches with mark tags', () => {
      const result = qualifyMarkdownText(str, 'query');
      expect(result).toEqual(
        toMdString([
          '# Run the <mark>query</mark> that is specified inline in the posted body.',
          'This allows running a <mark>query</mark> as defined in json in the posted body. This combines the two actions of posting & running a <mark>query</mark> into one step.',
        ])
      );
    });
  });
  describe('syntax highlighting', () => {
    test('it returns original string when there are no code blocks', () => {
      const str = toMdString(example.slice(0, 2));
      const result = qualifyMarkdownText(str, '');
      expect(result).toEqual(str);
    });

    test('it returns original string when code block syntax is unspecified', () => {
      const str = toMdString(example);
      const result = qualifyMarkdownText(str, '');
      expect(result).toEqual(str);
    });

    test('it returns json syntax tag for json specified syntax', () => {
      const newExample = [...example];
      newExample[3] = '```json';
      const str = toMdString(newExample);
      const result = qualifyMarkdownText(str, '');
      expect(result).toEqual(
        toMdString([
          ...example.slice(0, 3),
          '```',
          '<json/>',
          ...example.slice(4),
        ])
      );
    });
  });
  describe('syntax highlighting helpers', () => {
    const codeText = ['```', '  const foo: string = "bar"', '```'];
    test('it returns `markup` for untagged code text', () => {
      const str = toMdString(codeText);
      const result = getCodeLanguageFromTaggedText(str);
      expect(result).toEqual('markup');
    });

    test('it returns `json` for json tagged code text', () => {
      const newCodeText = [codeText[0], '<json/>', ...codeText.slice(1)];
      const str = toMdString(newCodeText);
      const result = getCodeLanguageFromTaggedText(str);
      expect(result).toEqual('json');
    });

    test('it removes json tag for code text display', () => {
      const newCodeText = [codeText[0], '<json/>', ...codeText.slice(1)];
      const str = toMdString(newCodeText);
      const result = removeCodeLanguageTags(str);
      expect(result).toEqual(toMdString(codeText));
    });

    test('it only removes syntax highlighting tags', () => {
      const newCodeText = [codeText[0], '<foobarlang/>', ...codeText.slice(1)];
      const str = toMdString(newCodeText);
      const result = removeCodeLanguageTags(str);
      expect(result).toEqual(str);
    });

    test('it adds syntax highlighting tags', () => {
      const newCodeText = ['```ruby', ...codeText.slice(1)];
      const resultCodeText = [codeText[0], '<ruby/>', ...codeText.slice(1)];
      const str = toMdString(newCodeText);
      const result = addCodeLanguageTags(str);
      expect(result).toEqual(toMdString(resultCodeText));
    });
  });
});
