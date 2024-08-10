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
import type { IMine, IFileCall, SourceLink } from './exampleInfo';
import { permaLink } from './exampleInfo';
import type { KeyedCollection } from './sdkModels';

/** All mined declaration data */
export interface IDeclarationMine extends IMine {
  types: DeclarationNuggets;
  methods: DeclarationNuggets;
}

export interface IDeclarationNugget extends IFileCall {}

export type DeclarationNuggets = KeyedCollection<IDeclarationNugget>;

/**
 * Searches for declaration of a given method or type and returns a GitHub
 * permalink if found
 * @param lode All declaration data
 * @param methodId Method id to search for
 * @param typeId Type id to search for
 * @param sourcerer Function to format source code link
 */
export const findDeclaration = (
  lode: IDeclarationMine,
  methodId?: string,
  typeId?: string,
  sourcerer: SourceLink = permaLink
) => {
  let declaration;
  if (methodId) {
    declaration = lode.methods[methodId];
  } else if (typeId) {
    declaration = lode.types[typeId];
  }

  let link;
  if (declaration) {
    link = sourcerer(
      lode.remoteOrigin,
      lode.commitHash,
      declaration.sourceFile,
      declaration.line
    );
    // link = ideLink(parentPath, declaration.sourceFile, declaration.line)
  }
  return { declaration, link };
};
