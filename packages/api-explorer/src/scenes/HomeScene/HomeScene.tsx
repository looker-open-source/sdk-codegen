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
import type { ApiModel } from '@looker/sdk-codegen';
import type { FC } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Space, Span, Tooltip } from '@looker/components';
import { ApixSection, DocMarkdown, DocTitle } from '../../components';

interface DocHomeProps {
  api: ApiModel;
}

interface DocHomeParams {
  specKey: string;
}

export const HomeScene: FC<DocHomeProps> = ({ api }) => {
  const { specKey } = useParams<DocHomeParams>();
  const lookerVersion = 'x-looker-release-version';

  return (
    <ApixSection>
      <Space>
        <DocTitle>{api.spec.info.title}</DocTitle>
        {api.spec.info[lookerVersion] && (
          <Tooltip content="Looker version providing this specification">
            <Span fontSize="small">{api.spec.info[lookerVersion]}</Span>
          </Tooltip>
        )}
      </Space>
      {api.spec.info.description && (
        <DocMarkdown source={api.spec.info.description} specKey={specKey} />
      )}
    </ApixSection>
  );
};
