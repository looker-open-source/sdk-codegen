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
import React, { useEffect } from 'react';
import type { ApiModel } from '@looker/sdk-codegen';
import { typeRefs, methodRefs } from '@looker/sdk-codegen';
import { useHistory, useParams } from 'react-router-dom';
import { Space, Box } from '@looker/components';

import {
  ApixSection,
  DocReferences,
  DocSDKs,
  DocSource,
  DocTitle,
  ExploreType,
  DocSchema,
} from '../../components';
import { useNavigation } from '../../utils';

interface DocTypeProps {
  api: ApiModel;
}

interface DocTypeParams {
  specKey: string;
  typeTag: string;
  typeName: string;
}

export const TypeScene: FC<DocTypeProps> = ({ api }) => {
  const { specKey, typeTag, typeName } = useParams<DocTypeParams>();
  const type = api.types[typeName];
  const history = useHistory();
  const { navigate } = useNavigation();
  const typesUsed = typeRefs(api, type?.customTypes);
  const methodsUsedBy = methodRefs(api, type?.methodRefs);
  const typesUsedBy = typeRefs(api, type?.parentTypes);
  useEffect(() => {
    if (!type) {
      const route = api.typeTags[typeTag]
        ? `/${specKey}/types/${typeTag}`
        : `/${specKey}/types`;
      navigate(route);
    }
  }, [history, specKey, type]);

  return (
    <>
      {type && (
        <ApixSection>
          <Space>
            <DocTitle>{type.name}</DocTitle>
            <DocSource type={type} />
          </Space>
          <Box pb="xlarge">
            <ExploreType api={api} type={type} />
          </Box>
          <DocReferences
            typesUsed={typesUsed}
            typesUsedBy={typesUsedBy}
            methodsUsedBy={methodsUsedBy}
            api={api}
            specKey={specKey}
          />
          <DocSDKs type={type} api={api} />
          <DocSchema object={type.schema} />
        </ApixSection>
      )}
    </>
  );
};
