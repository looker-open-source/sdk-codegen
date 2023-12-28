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

import React, { useEffect, useState } from 'react';
import { Tabs2, Tab2 } from '@looker/components';
import type { ApiModel, IMethod } from '@looker/sdk-codegen';
import { CollapserCard } from '@looker/run-it';
import { ErrorDoc } from '@looker/sdk-rtl';
import {
  apiErrorDisplayFetch,
  ExtMarkdown,
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

  let defaultTabId = tabNames[0];

  if (errorCode) {
    const pattern = new RegExp(`${errorCode}: \\w+`);
    tabNames.forEach((el) => {
      if (pattern.test(el)) {
        defaultTabId = el;
      }
    });
  }

  useEffect(() => {
    if (!errorCode) return;

    const getErrorContent = async () => {
      const docUrl = `/err/4.0/${errorCode}/${method.httpMethod.toLocaleLowerCase()}${
        method.endpoint
      }`;
      const adaptor = getEnvAdaptor();
      const errDoc = new ErrorDoc(adaptor.sdk, apiErrorDisplayFetch);
      const content = await errDoc.content(docUrl);
      setErrorContent(content);
    };
    getErrorContent();
  }, [errorCode]);

  if (responses.length === 0) return <></>;

  return (
    <CollapserCard heading="Response Models" id="response models">
      <Tabs2 defaultTabId={defaultTabId}>
        {Object.entries(responseTree).map(([statusCode, response]) => {
          const errorTab = errorCode && statusCode === defaultTabId;
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
