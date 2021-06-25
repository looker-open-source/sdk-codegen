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
import React, { BaseSyntheticEvent, Fragment } from 'react'
import {
  FieldText,
  FieldToggleSwitch,
  Label,
  FieldCheckbox,
} from '@looker/components'
import { InputDate } from '@looker/components/lib/date'
import { CodeEditor } from '@looker/code-editor'

import { RunItInput, RunItValues } from '../../RunIt'

const inputTextType = (type: string) => {
  switch (type) {
    case 'number':
      return 'number'
    case 'email':
      return 'email'
    case 'password':
      return 'password'
    default:
      return 'text'
  }
}

/**
 * Creates a datetime form item
 * @param name Form item's name
 * @param handleChange A callback function for updating the parent
 * component's requestContent state with date item changes
 * @param requestContent A state object containing the values of all form items
 * @returns A datetime form item
 */
const createDateItem = (
  name: string,
  handleChange: (name: string, date?: Date) => void,
  requestContent: RunItValues
) => (
  <div key={name}>
    <Label>{name}</Label>
    <InputDate
      defaultValue={name in requestContent ? requestContent[name] : undefined}
      onChange={handleChange.bind(null, name)}
    />
  </div>
)

/**
 * Creates a boolean form item
 * @param name Form item's name
 * @param description  Form item's description
 * @param handleChange A callback function that updates parent's component state when boolean item is clicked
 * @param requestContent A state object containing the values of all form items
 * @returns A boolean form item (a FieldToggleSwitch)
 */
const createBoolItem = (
  name: string,
  description: string,
  handleChange: (e: BaseSyntheticEvent) => void,
  requestContent: RunItValues
) => (
  <div key={name}>
    {description && <Label>{description}</Label>}
    <FieldToggleSwitch
      name={name}
      label={name}
      onChange={handleChange}
      on={name in requestContent ? requestContent[name] : false}
    />
  </div>
)

/**
 *
 * @param name Form item's name
 * @param description Form item's description
 * @param required Form item's required flag
 * @param type Form item's type
 * @param placeholder Form item's placeholder
 * @param handleChange A callback function that updates parent's component state when form item value changes
 * @param requestContent A state object containing the values of all form items
 * @returns A form item
 */
const createItem = (
  name: string,
  description: string,
  required: boolean,
  type: string,
  placeholder: string,
  handleChange: (e: BaseSyntheticEvent) => void,
  requestContent: RunItValues
) => (
  <div key={name}>
    <FieldText
      key={name}
      name={name}
      label={name}
      required={required}
      placeholder={`${placeholder} ${description || name}`}
      type={inputTextType(type)}
      value={name in requestContent ? requestContent[name] : ''}
      onChange={handleChange}
      width="100%"
    />
  </div>
)

/**
 * Creates a simple form item
 * @param input An object describing the form item
 * @param handleChange A callback function for updating the parent component's requestContent state with
 * text/email/password item changes
 * @param handleNumberChange A callback function for updating the parent component's requestContent state with number
 * item changes
 * @param handleBoolChange A callback function for updating the parent
 * component's requestContent state with bool item changes
 * @param handleDateChange A callback function for updating the parent
 * component's requestContent state with date item changes
 * @param requestContent A state object containing the values of all form items
 * @returns A simple form item
 */
export const createSimpleItem = (
  input: RunItInput,
  handleChange: (e: BaseSyntheticEvent) => void,
  handleNumberChange: (e: BaseSyntheticEvent) => void,
  handleBoolChange: (e: BaseSyntheticEvent) => void,
  handleDateChange: (name: string, date?: Date) => void,
  requestContent: RunItValues
) => {
  switch (input.type) {
    case 'boolean':
      return createBoolItem(
        input.name,
        input.description,
        handleBoolChange,
        requestContent
      )
    case 'int64':
    case 'integer':
    case 'float':
    case 'double':
      return createItem(
        input.name,
        input.description,
        input.required,
        'number',
        '(number)',
        handleNumberChange,
        requestContent
      )
    case 'string':
    case 'hostname':
    case 'uuid':
    case 'uri':
    case 'ipv4':
    case 'ipv6':
      return createItem(
        input.name,
        input.description,
        input.required,
        'string',
        '(string)',
        handleChange,
        requestContent
      )
    case 'email':
    case 'password':
      return createItem(
        input.name,
        input.description,
        input.required,
        input.type,
        '(string)',
        handleChange,
        requestContent
      )
    case 'datetime':
      return createDateItem(input.name, handleDateChange, requestContent)
    default:
      return <Fragment key={input.name}></Fragment>
  }
}

/**
 * Creates a complex item
 * @param input An object describing the form item
 * @param handleComplexChange A callback function for updating the parent
 * component's requestContent state
 * @param requestContent A state object containing the values of all form items
 * @returns A complex form item
 */
export const createComplexItem = (
  input: RunItInput,
  handleComplexChange: (value: string, name: string) => void,
  requestContent: RunItValues
) => (
  <div key={input.name}>
    <Label>{input.name}</Label>
    <CodeEditor
      language="json"
      code={
        input.name in requestContent
          ? requestContent[input.name]
          : JSON.stringify(input.type, null, 2)
      }
      lineNumbers={false}
      onChange={handleComplexChange.bind(null, input.name)}
      transparent={true}
    />
  </div>
)

/**
 * Creates a required checkbox form item
 */
export const showDataChangeWarning = () => (
  <FieldCheckbox
    key="warning"
    required
    label="I understand that this API endpoint will change data."
  />
)

/**
 * Updates a given state with a key/value pair, taking into consideration
 * indeterminate values.
 * @param state A collection to update
 * @param key Property to update
 * @param newValue? New value corresponding to given key
 */
export const updateNullableProp = (
  state: RunItValues,
  key: string,
  newValue?: any
) => {
  const updatedState = { ...state }
  if (key in state && !newValue) {
    delete updatedState[key]
  } else {
    updatedState[key] = newValue
  }
  return updatedState
}
