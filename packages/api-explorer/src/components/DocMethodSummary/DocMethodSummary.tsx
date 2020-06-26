/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import React, { FC } from 'react'
import { Card, CardContent, Space, Text } from '@looker/components'
import { IMethod } from '@looker/sdk-codegen'

import { MethodBadge } from '../SideNav/MethodBadge'
import {
  DocActivityType,
  DocRateLimited,
} from '../../scenes/MethodScene/components'
import { DocSummaryStatus } from './DocSummaryStatus'

interface DocMethodSummaryProps {
  method: IMethod
}

export const DocMethodSummary: FC<DocMethodSummaryProps> = ({ method }) => {
  return (
    <Card raised>
      <CardContent>
        <Space>
          <MethodBadge verb={method.httpMethod} />
          {method.summary}
          <DocSummaryStatus method={method} />
          <DocRateLimited method={method} />
          <DocActivityType method={method} />
        </Space>
        <Text variant="subdued">{method.endpoint}</Text>
      </CardContent>
    </Card>
  )
}
