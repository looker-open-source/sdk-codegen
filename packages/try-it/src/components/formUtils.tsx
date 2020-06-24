import React, { BaseSyntheticEvent, Fragment } from 'react'
import {
  FieldText,
  FieldToggleSwitch,
  InputDate,
  Label,
  FieldCheckbox,
} from '@looker/components'

import { TryItInput, TryItValues } from '../TryIt'

import { CodeStructure } from './CodeStructure'

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
  requestContent: TryItValues
) => (
  <div key={name}>
    <Label>{name}</Label>
    <InputDate
      defaultValue={
        name in requestContent ? requestContent[name] : new Date(Date.now())
      }
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
  requestContent: TryItValues
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
 * @param handleChange A callback function that updates parent's component state
 * when form item value changes
 * @returns A form item
 */
const createItem = (
  name: string,
  description: string,
  required: boolean,
  type: string,
  placeholder: string,
  handleChange: (e: BaseSyntheticEvent) => void
) => (
  <div key={name}>
    <FieldText
      key={name}
      name={name}
      label={name}
      required={required}
      placeholder={`${placeholder} ${description || name}`}
      type={inputTextType(type)}
      onChange={handleChange}
      width="100%"
    />
  </div>
)

/**
 * Creates a simple form item
 * @param input An object describing the form item
 * @param handleChange A callback function for updating the parent component's
 * requestContent state with text/number/email/password item changes
 * @param handleBoolChange A callback function for updating the parent
 * component's requestContent state with bool item changes
 * @param handleDateChange A callback function for updating the parent
 * component's requestContent state with date item changes
 * @param requestContent A state object containing the values of all form items
 * @returns A simple form item
 */
export const createSimpleItem = (
  input: TryItInput,
  handleChange: (e: BaseSyntheticEvent) => void,
  handleNumberChange: (e: BaseSyntheticEvent) => void,
  handleBoolChange: (e: BaseSyntheticEvent) => void,
  handleDateChange: (name: string, date?: Date) => void,
  requestContent: TryItValues
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
        handleNumberChange
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
        handleChange
      )
    case 'email':
    case 'password':
      return createItem(
        input.name,
        input.description,
        input.required,
        input.type,
        '(string)',
        handleChange
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
  input: TryItInput,
  handleComplexChange: (value: string, name: string) => void,
  requestContent: TryItValues
) => (
  <div key={input.name}>
    <Label>{input.name}</Label>
    <CodeStructure
      language="json"
      code={
        input.name in requestContent
          ? requestContent[input.name]
          : JSON.stringify(input.type, null, 2)
      }
      fontSize={14}
      width={'810px'}
      onChange={handleComplexChange.bind(null, input.name)}
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
