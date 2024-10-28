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
import React, { useState } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { ApiModel } from '@looker/sdk-codegen';
import {
  Card,
  ComponentsProvider,
  Flex,
  Select,
  Space,
} from '@looker/components';
import { RunIt } from '../src';

import { specs } from '../../api-explorer/src/test-data';
import { createInputs } from '../../api-explorer/src/scenes/MethodScene/utils';
import { OAuthScene } from '../src/scenes';

export const RunItDemo: FC = () => {
  const specKey = '4.0';
  const api = ApiModel.fromJson(specs[specKey].specContent);
  const [method, setMethod] = useState(api.methods.me);
  const [inputs, setInputs] = useState(createInputs(api, method));
  const options = Object.values(api.methods).map(m => {
    const result: any = {
      value: m.name,
      label: `${m.name}: ${m.summary}`,
    };
    if (m.name === 'me') result.scrollIntoView = true;
    return result;
  });

  const handleSelection = (value: string) => {
    const method = api.methods[value];
    setMethod(method);
    setInputs(createInputs(api, method));
  };

  return (
    <ComponentsProvider>
      <BrowserRouter>
        <Flex
          justifyContent="center"
          minHeight="100vh"
          minWidth="100vw"
          backgroundColor="palette.purple500"
          p={['medium', 'xxlarge']}
        >
          <Card raised minWidth="75%" maxWidth={600} p={['medium', 'xlarge']}>
            <Space>
              <span>Method to run:</span>
              <Select
                autoResize
                placeholder="Select the method to run ..."
                options={options}
                listLayout={{ width: 'auto' }}
                onChange={handleSelection}
              />
            </Space>
            <RunIt api={api} inputs={inputs} method={method} />
            <Route path="/oauth">
              <OAuthScene />
            </Route>
          </Card>
        </Flex>
      </BrowserRouter>
    </ComponentsProvider>
  );
};
