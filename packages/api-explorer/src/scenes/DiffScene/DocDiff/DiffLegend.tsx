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
import type { DiffCount } from '@looker/sdk-codegen';
import { Code, Flex, Icon, Space } from '@looker/components';
import { Add } from '@styled-icons/material/Add';
import { ChangeHistory } from '@styled-icons/material/ChangeHistory';
import { Remove } from '@styled-icons/material/Remove';

interface DiffLegendProps {
  count: DiffCount;
}

export const DiffLegend: FC<DiffLegendProps> = ({ count }) => {
  return (
    <Flex>
      {count.added > 0 && (
        <Space gap="xxsmall">
          <Icon icon={<Add />} color="positive" size="small" />
          <Code color="positive" fontWeight="medium">
            {count.added}
          </Code>
        </Space>
      )}
      {count.changed > 0 && (
        <Space gap="xxsmall">
          <Icon icon={<ChangeHistory />} color="warn" size="small" />
          <Code color="warn" fontWeight="medium">
            {count.changed}
          </Code>
        </Space>
      )}
      {count.removed > 0 && (
        <Space gap="xxsmall">
          <Icon icon={<Remove />} color="critical" size="small" />
          <Code color="critical" fontWeight="medium">
            {count.removed}
          </Code>
        </Space>
      )}
    </Flex>
  );
};
