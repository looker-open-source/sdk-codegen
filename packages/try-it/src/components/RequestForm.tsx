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

import React, { BaseSyntheticEvent, FC, Dispatch } from 'react'
import { Button, Form, Space } from '@looker/components'

import { TryItHttpMethod, TryItInput, TryItValues } from '../TryIt'
import {
  createSimpleItem,
  createComplexItem,
  showDataChangeWarning,
} from './formUtils'
import { ConfigDialog } from './ConfigDialog'

interface RequestFormProps {
  inputs: TryItInput[]
  handleSubmit: (e: BaseSyntheticEvent) => void
  httpMethod: TryItHttpMethod
  requestContent: TryItValues
  setRequestContent: Dispatch<{ [key: string]: any }>
  allowConfig?: boolean
}

export const RequestForm: FC<RequestFormProps> = ({
  inputs,
  httpMethod,
  handleSubmit,
  requestContent,
  setRequestContent,
  allowConfig = false,
}) => {
  const handleBoolChange = (e: BaseSyntheticEvent) => {
    setRequestContent({ ...requestContent, [e.target.name]: e.target.checked })
  }

  const handleNumberChange = (e: BaseSyntheticEvent) => {
    // TODO: e.target.valueAsNumber works in the browser but is undefined here
    setRequestContent({
      ...requestContent,
      [e.target.name]: parseFloat(e.target.value),
    })
  }

  const handleDateChange = (name: string, date?: Date) => {
    setRequestContent({ ...requestContent, [name]: date })
  }

  const handleChange = (e: BaseSyntheticEvent) => {
    setRequestContent({ ...requestContent, [e.target.name]: e.target.value })
  }

  const handleComplexChange = (name: string, value: string) => {
    setRequestContent({ ...requestContent, [name]: value })
  }

  return (
    <Form>
      {inputs.map((input) =>
        typeof input.type === 'string'
          ? createSimpleItem(
              input,
              handleChange,
              handleNumberChange,
              handleBoolChange,
              handleDateChange,
              requestContent
            )
          : createComplexItem(input, handleComplexChange, requestContent)
      )}
      {httpMethod !== 'GET' && showDataChangeWarning()}
      <Space>
        <Button onClick={handleSubmit}>Try It</Button>
        {allowConfig && <ConfigDialog />}
      </Space>
    </Form>
  )
}
