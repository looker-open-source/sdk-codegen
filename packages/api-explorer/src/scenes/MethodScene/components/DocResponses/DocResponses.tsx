/*

 Copyright 2021-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import React, { useEffect, useState } from 'react';
import { Tab2, Tabs2 } from '@looker/components';
import type { ApiModel, IMethod } from '@looker/sdk-codegen';
import { CollapserCard } from '@looker/run-it';
import { ErrorDoc } from '@looker/sdk-rtl';
import {
  ExtMarkdown,
  apiErrorDisplayFetch,
  getEnvAdaptor,
} from '@looker/extension-utils';

import { DocResponseTypes } from './DocResponseTypes';
import { buildResponseTree } from './utils';

interface DocResponsesProps {
  api: ApiModel;
  method: IMethod;
  /** error code to display */
  errorCode?: string;
}

/**
 * Renders a tab list and tab panels for different method response types
 */
export const DocResponses = ({ api, method, errorCode }: DocResponsesProps) => {
  const [errorContent, setErrorContent] = useState('');
  const responses = method.responses;

  const responseTree = buildResponseTree(responses);
  const tabNames = Object.keys(responseTree);

  const validErrorCode =
    errorCode && /^\d{3}$/.test(errorCode) ? errorCode : undefined;
  const matchedErrorTab = validErrorCode
    ? tabNames.find(el => el.startsWith(`${validErrorCode}:`))
    : undefined;
  const defaultTabId = matchedErrorTab ?? tabNames[0];

  useEffect(() => {
    let cancelled = false;
    setErrorContent('');
    if (!validErrorCode || !matchedErrorTab) {
      return () => {
        cancelled = true;
      };
    }

    const getErrorContent = async () => {
      const docUrl = `/err/4.0/${validErrorCode}/${method.httpMethod.toLocaleLowerCase()}${
        method.endpoint
      }`;
      const adaptor = getEnvAdaptor();
      const errDoc = new ErrorDoc(adaptor.sdk, apiErrorDisplayFetch);
      const content = await errDoc.content(docUrl);
      if (!cancelled) {
        setErrorContent(content);
      }
    };
    getErrorContent();

    return () => {
      cancelled = true;
    };
  }, [matchedErrorTab, validErrorCode, method.endpoint, method.httpMethod]);

  if (responses.length === 0) return <></>;

  return (
    <CollapserCard heading="Response Models" id="response models">
      <Tabs2 key={`${method.id}-${defaultTabId}`} defaultTabId={defaultTabId}>
        {Object.entries(responseTree).map(([statusCode, response]) => {
          const errorTab =
            Boolean(matchedErrorTab) && statusCode === matchedErrorTab;
          return (
            <Tab2 key={statusCode} id={statusCode} label={statusCode}>
              <DocResponseTypes api={api} responses={response} />
              {errorContent && errorTab && (
                <ExtMarkdown source={errorContent} />
              )}
            </Tab2>
          );
        })}
      </Tabs2>
    </CollapserCard>
  );
};
