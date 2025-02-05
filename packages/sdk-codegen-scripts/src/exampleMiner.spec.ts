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

import path from 'path';
import type { SDKCalls } from '@looker/sdk-codegen';
import {
  CodeMiner,
  ExampleMiner,
  MarkdownMiner,
  filterCodeFiles,
  getAllFiles,
  getCodeFiles,
  getCommitHash,
  getPermalinkRoot,
  getRemoteHttpOrigin,
} from './exampleMiner';

describe('example mining', () => {
  const sourcePath = path.join(__dirname, '/../../../examples');
  const exampleFile = (fileName: string) =>
    path.join(sourcePath, '/', fileName);

  describe('gets files', () => {
    it('all files', () => {
      const actual = getAllFiles(sourcePath);
      expect(actual.length).toBeGreaterThan(0);
    });

    it('code files', () => {
      const actual = getCodeFiles(sourcePath);
      expect(actual.length).toBeGreaterThan(0);
    });

    it('should get code files matching pattern', () => {
      const filter = (pattern: RegExp, fileName: string) => {
        const fileMatch = pattern.test(fileName);
        return filterCodeFiles(fileName) && fileMatch;
      };
      const actual = getCodeFiles(
        sourcePath,
        undefined,
        filter.bind(null, /^download_.*\.py/)
      );
      expect(actual).toHaveLength(4);
    });
  });

  describe('link info functions', () => {
    it('getCommitHash', () => {
      const actual = getCommitHash();
      expect(actual).toBeDefined();
      expect(actual.length).toEqual(40);
    });
    it('getRemoteHttpOrigin', () => {
      const actual = getRemoteHttpOrigin();
      expect(
        actual.startsWith('https://github.com/looker-open-source/sdk-codegen')
      ).toEqual(true);
    });
    it('getPermalinkRoot', () => {
      const actual = getPermalinkRoot();
      expect(actual).toEqual(
        'https://github.com/looker-open-source/sdk-codegen'
      );
    });
  });

  describe('MarkdownMiner', () => {
    const marker = new MarkdownMiner();
    it('ignores http and https links', () => {
      const ignore1 = 'http://foo.bar/.ts';
      const ignore2 = 'HTTPS://foo.bar/.ts';
      expect(marker.ignoreLink(ignore1)).toEqual(true);
      expect(marker.ignoreLink(ignore2)).toEqual(true);
    });
    it('strips hash information from a file name', () => {
      const expected = 'example/typescript/user.ts';
      const hashed = 'example/typescript/user.ts#L1:L2';
      expect(marker.stripSearch(hashed)).toEqual(expected);
    });
    it('accepts a source code file', () => {
      const accept1 = 'example/typescript/user.ts';
      const accept2 = 'example/typescript/user.ts#L1:L2';
      expect(marker.ignoreLink(accept1)).toEqual(false);
      expect(marker.ignoreLink(accept2)).toEqual(false);
    });
    describe('mineContent', () => {
      describe('simple refs', () => {
        it('processes standard url patterns', () => {
          const md = '[summary1](example.ts#strip me!)';
          const actual = marker.mineContent('example/typescript/README.md', md);
          expect(actual).toHaveLength(1);
          const first = actual[0];
          expect(first.summary).toEqual('summary1');
          expect(first.sourceFile).toEqual('example/typescript/example.ts');
        });
        it('processes multiple refs on the same line', () => {
          const md =
            'generators like [TypeScript](/packages/sdk-codegen/src/typescript.gen.ts) or [Python](/packages/sdk-codegen/src/python.gen.ts) are useful';
          const actual = marker.mineContent(
            'packages/sdk-codegen/README.md',
            md
          );
          expect(actual).toHaveLength(2);
          const first = actual[0];
          expect(first.summary).toEqual('TypeScript');
          expect(first.sourceFile).toEqual(
            'packages/sdk-codegen/src/typescript.gen.ts'
          );
          const second = actual[1];
          expect(second.summary).toEqual('Python');
          expect(second.sourceFile).toEqual(
            'packages/sdk-codegen/src/python.gen.ts'
          );
        });
      });
      it('processes link url patterns', () => {
        const md =
          'Logout all users on the instance [[link]](logout_all_users.rb)';
        const actual = marker.mineContent('example/ruby/README.md', md);
        expect(actual).toHaveLength(1);
        const first = actual[0];
        expect(first.summary).toEqual('Logout all users on the instance');
        expect(first.sourceFile).toEqual('example/ruby/logout_all_users.rb');
      });
      it('processes link url patterns and strips leading dash', () => {
        const md =
          '\t  -  Logout all users on the instance [[link]](logout_all_users.rb)';
        const actual = marker.mineContent('example/ruby/README.md', md);
        expect(actual).toHaveLength(1);
        const first = actual[0];
        expect(first.summary).toEqual('Logout all users on the instance');
        expect(first.sourceFile).toEqual('example/ruby/logout_all_users.rb');
      });
      it.skip('processes multiple link url patterns and strips leading dash', () => {
        const md =
          '\t  -  Logout all users on the instance [[link]](logout_all_users.rb) logs in [[link]](logs_in.rb)';
        const actual = marker.mineContent('example/ruby/README.md', md);
        expect(actual).toHaveLength(2);
        const first = actual[0];
        expect(first.summary).toEqual('Logout all users on the instance');
        expect(first.sourceFile).toEqual('example/ruby/logout_all_users.rb');
        const second = actual[0];
        expect(second.summary).toEqual('logs in');
        expect(second.sourceFile).toEqual('example/ruby/logs_in.rb');
      });
    });
    it('processes a file', () => {
      const fileName = exampleFile('ruby/README.md');
      const actual = marker.mineFile(fileName);
      expect(actual.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('CodeMiner', () => {
    const coder = new CodeMiner();
    const probe = (code: string, expected: SDKCalls) => {
      const actual = coder.mineCode(code);
      expect(actual).toEqual(expected);
    };

    it('is empty for no sdk calls', () => {
      probe('', []);
      probe('one() two() three()', []);
      probe('foo.one() bar.two() boo.three()', []);
      probe('foo.one()\nbar.two()\nboo.three()', []);
    });

    it('ignores ok and finds ts calls', () => {
      probe(`const value = await sdk.ok(sdk.me())`, [
        { sdk: 'sdk', operationId: 'me', line: 1, column: 27 },
      ]);
    });

    it('ignores ok and finds kotlin calls', () => {
      probe(`val look = sdk.ok<Look>(sdk.create_look(WriteLookWithQuery(`, [
        { sdk: 'sdk', operationId: 'create_look', line: 1, column: 24 },
      ]);
    });

    it.skip('ignores comments and ok', () => {
      probe(
        `// this is a code comment sdk.comment()\nconst value = await coreSDK.ok(coreSDK.me())`,
        [{ sdk: 'coreSDK', operationId: 'me', line: 2, column: 33 }]
      );
    });

    it('mines a python file', () => {
      const fileName = exampleFile('python/run_look_with_filters.py');
      const actual = coder.mineFile(fileName);
      expect(actual.length).toBeGreaterThan(0);
    });

    it('mines a ruby file', () => {
      const fileName = exampleFile('ruby/delete_unused_content.rb');
      const actual = coder.mineFile(fileName);
      expect(actual.length).toBeGreaterThan(0);
    });

    it('mines a swift file', () => {
      const fileName = exampleFile(
        'swift/sample-swift-sdk/sample-swift-sdk/Dashboards.swift'
      );
      const actual = coder.mineFile(fileName);
      expect(actual.length).toBeGreaterThan(0);
    });

    it('mines a typescript file', () => {
      const fileName = exampleFile('typescript/utils.ts');
      const actual = coder.mineFile(fileName);
      expect(actual.length).toBeGreaterThan(0);
    });
  });

  describe('Miner', () => {
    it('relate', () => {
      expect(ExampleMiner.relate('/a/b/c/', '/a/b/c/d.txt')).toEqual('d.txt');
      expect(ExampleMiner.relate('/a/b/c/', '/a/b/c/d/e.txt')).toEqual(
        'd/e.txt'
      );
    });

    it('processes files', () => {
      const miner = new ExampleMiner(sourcePath);
      const actual = miner.lode;
      expect(actual).toBeDefined();
      expect(actual.commitHash).toBeDefined();
      expect(Object.entries(actual.nuggets).length).toBeGreaterThan(40);
    });
  });
});
