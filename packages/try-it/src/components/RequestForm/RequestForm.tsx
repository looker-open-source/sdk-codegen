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
import { Button, Form } from '@looker/components'

import { TryItHttpMethod, TryItInput, TryItValues } from '../../TryIt'
import {
  createSimpleItem,
  createComplexItem,
  showDataChangeWarning,
} from './formUtils'

/**
 * Properties required by RequestForm
 */
interface RequestFormProps {
  inputs: TryItInput[]
  /** A callback for submitting the form */
  handleSubmit: (e: BaseSyntheticEvent) => void
  /** HTTP method used for this REST request */
  httpMethod: TryItHttpMethod
  /** A collection type react state to store path, query and body parameters as entered by the user  */
  requestContent: TryItValues
  /** A set state callback fn for populating requestContent on interaction with the request form */
  setRequestContent: Dispatch<{ [key: string]: any }>
}

/**
 * Dynamically generates a REST request form and its form elements corresponding to parameters from an array of TryIt
 * inputs
 */
export const RequestForm: FC<RequestFormProps> = ({
  inputs,
  httpMethod,
  handleSubmit,
  requestContent,
  setRequestContent,
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
    <Form onSubmit={handleSubmit}>
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
      <Button>Try It</Button>
    </Form>
  )
}
