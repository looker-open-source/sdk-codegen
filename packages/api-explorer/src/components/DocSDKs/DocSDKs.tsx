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

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type {
  IMethod,
  IType,
  ApiModel,
  KeyedCollection,
  CodeGen,
} from '@looker/sdk-codegen';
import { CollapserCard, getGenerators } from '@looker/run-it';

import { DocCode } from '../DocCode';
import { selectSdkLanguage } from '../../state';
import { isMethod } from '../../utils/path';
import { noComment } from './utils';
import { DocDeclarations } from './DocDeclarations';

interface LanguageSDKProps {
  /** API spec */
  api: ApiModel;
  /** An SDK method */
  method?: IMethod;
  /** An SDK type */
  type?: IType;
}

const getDeclarations = (
  generators: KeyedCollection<CodeGen>,
  sdkLanguage: string,
  item: IMethod | IType
) => {
  const declarations: KeyedCollection<string> = {};
  Object.entries(generators).forEach(([language, gen]) => {
    if (sdkLanguage === 'All' || language === sdkLanguage) {
      const code = isMethod(item)
        ? gen.declareMethod('', item as IMethod)
        : gen.declareType('', item as IType);
      declarations[language] = code;
    }
  });
  return declarations;
};

/**
 * Given a method or a type, it renders its SDK declaration in all supported languages.
 */
export const DocSDKs: FC<LanguageSDKProps> = ({ api, method, type }) => {
  const sdkLanguage = useSelector(selectSdkLanguage);
  const generators = getGenerators(api);
  const [item, setItem] = useState(method ? noComment(method) : type!);
  const [declarations, setDeclarations] = useState(
    getDeclarations(generators, sdkLanguage, item)
  );
  const [header, setHeader] = useState(`${sdkLanguage} Declaration`);

  useEffect(() => {
    setItem(method ? noComment(method) : type!);
  }, [method, type]);

  useEffect(() => {
    const declarations = getDeclarations(generators, sdkLanguage, item);
    setDeclarations(declarations);
    const languages = Object.keys(declarations);
    if (languages.length > 1) {
      setHeader('Declarations');
    } else {
      setHeader(`${languages[0]} Declaration`);
    }
  }, [sdkLanguage, item]);

  return (
    <CollapserCard heading={header} id="sdk declarations">
      {Object.keys(declarations).length > 1 ? (
        <DocDeclarations declarations={declarations} />
      ) : (
        <DocCode
          language={Object.keys(declarations)[0]}
          code={Object.values(declarations)[0]}
        />
      )}
    </CollapserCard>
  );
};
