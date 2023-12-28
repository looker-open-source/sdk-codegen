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
import React from 'react';
import { Card, CardContent, Flex, Space, Text } from '@looker/components';
import type { IMethod } from '@looker/sdk-codegen';
import { MethodBadge, RunItHeading } from '@looker/run-it';
import { DocActivityType, DocRateLimited } from '../../components';
import { DocSummaryStatus } from './DocSummaryStatus';

interface DocMethodSummaryProps {
  method: IMethod;
}

export const DocMethodSummary: FC<DocMethodSummaryProps> = ({ method }) => (
  <Card maxWidth="50rem" border>
    <CardContent>
      <Space align="start" between>
        <MethodBadge
          type={method.httpMethod}
          textAlign="center"
          minWidth="3.7625rem"
        >
          {method.httpMethod.toUpperCase()}
        </MethodBadge>
        <Flex alignItems="start" flexDirection="column" flex="1" mx="small">
          <RunItHeading as="h3" mb="0" pt="0">
            {method.summary}
          </RunItHeading>
          <Space>
            <DocRateLimited method={method} />
            <DocActivityType method={method} />
          </Space>
          <Text color="subdued">{method.endpoint}</Text>
        </Flex>
        <DocSummaryStatus status={method.status} />
      </Space>
    </CardContent>
  </Card>
);
