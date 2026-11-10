/*

 Copyright 2022-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

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
    0?: string;
    specKey: string;
    statusCode: string;
    verb: string;
  }>(`/:specKey/err/:statusCode/:verb/*`);
  const methodPath = match?.params[0] ?? '';
  const adaptor = getEnvAdaptor();
  const errorDoc = new ErrorDoc(adaptor.sdk);
  const restPath = errorDoc.specPath(methodPath);

  const methodId = `${match?.params.verb} /${restPath}`.toLocaleLowerCase();
  const specKey = match?.params.specKey;
  const statusCode = match?.params.statusCode;
  const validStatusCode =
    statusCode && /^\d{3}$/.test(statusCode) ? statusCode : undefined;

  const method = Object.values(api.methods).find(
    method => method.id.toLocaleLowerCase() === methodId
  );

  const methodTag = method?.schema.tags[0];
  const methodName = method?.operationId;

  const { buildPathWithGlobalParams } = useNavigation();

  const targetPath =
    methodTag && methodName
      ? `/${specKey}/methods/${methodTag}/${methodName}`
      : `/${specKey}/methods`;

  const redirectPath = buildPathWithGlobalParams(
    targetPath,
    methodTag && methodName && validStatusCode
      ? { e: validStatusCode }
      : undefined
  );

  return <Redirect to={redirectPath} />;
};
