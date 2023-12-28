/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { Redirect, useRouteMatch } from 'react-router-dom';
import { getEnvAdaptor } from '@looker/extension-utils';
import { ErrorDoc } from '@looker/sdk-rtl';
import React from 'react';
import type { IApiModel } from '@looker/sdk-codegen';

import { useNavigation } from '../../utils';

interface ErrorDetailSceneProps {
  api: IApiModel;
}

/**
 * Scene responsible for redirecting users from an error doc link to a specific
 * method scene
 */
export const ErrorDetailScene = ({ api }: ErrorDetailSceneProps) => {
  const match = useRouteMatch<{
    specKey: string;
    statusCode: string;
    verb: string;
  }>(`/:specKey/err/:statusCode/:verb/*`);
  const methodPath = match?.params[0];
  const adaptor = getEnvAdaptor();
  const errorDoc = new ErrorDoc(adaptor.sdk);
  const restPath = errorDoc.specPath(methodPath);

  const methodId = `${match?.params.verb} /${restPath}`.toLocaleLowerCase();
  const specKey = match?.params.specKey;
  const statusCode = match?.params.statusCode;

  const method = Object.values(api.methods).find(
    (method) => method.id.toLocaleLowerCase() === methodId
  );

  const methodTag = method?.schema.tags[0];
  const methodName = method?.operationId;

  const { buildPathWithGlobalParams } = useNavigation();

  const redirectPath = buildPathWithGlobalParams(
    `/${specKey}/methods/${methodTag}/${methodName}`,
    { e: statusCode }
  );

  return <Redirect to={redirectPath} />;
};
