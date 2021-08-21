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

import React, { BaseSyntheticEvent, FC, Dispatch } from 'react'
import { Button, Form, Space, ButtonTransparent } from '@looker/components'
import type { IAPIMethods } from '@looker/sdk-rtl'
import { RunItHttpMethod, RunItInput, RunItValues } from '../../RunIt'
import { ConfigDialog, RunItConfigurator } from '../ConfigForm'
import { LoginForm } from '../LoginForm'
import { RunItSetter } from '../..'
import {
  createSimpleItem,
  createComplexItem,
  showDataChangeWarning,
  updateNullableProp,
} from './formUtils'

/** Properties required by RequestForm */
interface RequestFormProps {
  /** Established SDK instance */
  sdk: IAPIMethods
  /** Request inputs to the endpoint */
  inputs: RunItInput[]
  /** A callback for submitting the form */
  handleSubmit: (e: BaseSyntheticEvent) => void
  /** HTTP method used for this REST request */
  httpMethod: RunItHttpMethod
  /** A collection type react state to store path, query and body parameters as entered by the user  */
  requestContent: RunItValues
  /** A set state callback fn for populating requestContent on interaction with the request form */
  setRequestContent: Dispatch<RunItValues>
  /** Is authentication required? */
  needsAuth: boolean
  /** Does RunIt have the configuration values it needs? */
  hasConfig: boolean
  /** Hook to refresh specifications */
  setVersionsUrl: RunItSetter
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** Configuration plug-in for stand-alone or extension */
  configurator: RunItConfigurator
  /** Is RunIt being used in a Looker extension? */
  isExtension?: boolean
}

/**
 * Dynamically generates a REST request form and its form elements corresponding to parameters from an array of RunIt
 * inputs
 */
export const RequestForm: FC<RequestFormProps> = ({
  sdk,
  inputs,
  httpMethod,
  handleSubmit,
  requestContent,
  setRequestContent,
  needsAuth,
  hasConfig,
  setVersionsUrl,
  setHasConfig,
  configurator,
  isExtension = false,
}) => {
  const handleBoolChange = (e: BaseSyntheticEvent) => {
    setRequestContent({ ...requestContent, [e.target.name]: e.target.checked })
  }

  const handleNumberChange = (e: BaseSyntheticEvent) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined
    const newState = updateNullableProp(requestContent, e.target.name, value)
    setRequestContent(newState)
  }

  const handleDateChange = (name: string, date?: Date) => {
    const newState = updateNullableProp(requestContent, name, date)
    setRequestContent(newState)
  }

  const handleChange = (e: BaseSyntheticEvent) => {
    const newState = updateNullableProp(
      requestContent,
      e.target.name,
      e.target.value
    )
    setRequestContent(newState)
  }

  const handleComplexChange = (name: string, value: string) => {
    setRequestContent({ ...requestContent, [name]: value })
  }

  const handleClear = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    setRequestContent({})
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
      <Space>
        <ButtonTransparent type="button" onClick={handleClear}>
          Clear
        </ButtonTransparent>
        {hasConfig ? (
          needsAuth ? (
            <LoginForm
              sdk={sdk}
              setVersionsUrl={setVersionsUrl}
              setHasConfig={setHasConfig}
              configurator={configurator}
              requestContent={requestContent}
            />
          ) : (
            <Button type="submit">Run</Button>
          )
        ) : (
          !isExtension &&
          setHasConfig && (
            <ConfigDialog
              setHasConfig={setHasConfig}
              configurator={configurator}
              setVersionsUrl={setVersionsUrl}
            />
          )
        )}
      </Space>
    </Form>
  )
}
