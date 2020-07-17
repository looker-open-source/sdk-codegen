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

import React, {
  BaseSyntheticEvent,
  Dispatch,
  FC,
  FormEvent,
  useState,
} from 'react'
import {
  Button,
  FieldRadioGroup,
  Fieldset,
  FieldText,
  Form,
  Heading,
  Text,
  ValidationMessages,
} from '@looker/components'
import {
  StorageLocation,
  getStorage,
  removeStorage,
  setStorage,
  TryItConfigKey,
  validateUrl,
  validLocation,
} from './configUtils'

interface ConfigFormProps {
  title?: string
  dialogue?: boolean
  setHasConfig?: Dispatch<boolean>
}

const storageOptions = [
  { label: 'Session', value: 'session' },
  { label: 'Local', value: 'local' },
]

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  dialogue = false,
  setHasConfig,
}) => {
  // See https://codesandbox.io/s/youthful-surf-0g27j?file=/src/index.tsx for a prototype from Luke
  // TODO see about useReducer to clean this up a bit more
  title = title || 'TryIt Configuration'

  // get configuration from storage, or default it
  const storage = getStorage(TryItConfigKey)
  let config = { base_url: '', looker_url: '' }
  const location = storage.location
  if (storage.value) config = JSON.parse(storage.value)
  const { base_url, looker_url } = config

  const [fields, setFields] = useState({
    baseUrl: base_url,
    lookerUrl: looker_url,
    location: location,
  })

  const [validationMessages, setValidationMessages] = useState<
    ValidationMessages
  >({})

  const handleFormSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    setStorage(
      TryItConfigKey,
      JSON.stringify({
        base_url: fields.baseUrl,
        looker_url: fields.lookerUrl,
      }),
      fields.location
    )
    if (setHasConfig) setHasConfig(true)
  }

  const handleRemove = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    removeStorage(TryItConfigKey)
    if (setHasConfig) setHasConfig(false)
  }

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    const newFields = { ...fields }
    newFields[event.currentTarget.name] = event.currentTarget.value
    setFields(newFields)
  }

  const handleUrlChange = (event: FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.name

    const newValidationMessages = { ...validationMessages }

    const url = validateUrl(event.currentTarget.value)
    if (url) {
      delete newValidationMessages[name]
      // Update URL if it's been cleaned up
      event.currentTarget.value = url
    } else {
      newValidationMessages[name] = {
        message: `'${event.currentTarget.value}' is not a valid url`,
        type: 'error',
      }
    }
    handleInputChange(event)

    setValidationMessages(newValidationMessages)
  }

  const handleLocationChange = (location: string) => {
    const name = 'location'
    const newValidationMessages = { ...validationMessages }

    if (validLocation(location)) {
      const newFields = { ...fields }
      newFields.location = location as StorageLocation
      setFields(newFields)
      delete newValidationMessages[name]
    } else {
      newValidationMessages[name] = {
        message: `${location} is must be either 'session' or 'local'}`,
        type: 'error',
      }
    }

    setValidationMessages(newValidationMessages)
  }

  return (
    <>
      <Heading>
        <Text>{title}</Text>
      </Heading>
      <Form validationMessages={validationMessages}>
        <Fieldset legend="Server locations">
          <FieldText
            required
            label="API server url"
            placeholder="typically https://myserver.looker.com:19999"
            name="baseUrl"
            defaultValue={fields.baseUrl}
            onChange={handleUrlChange}
          />
          <FieldText
            required
            label="Auth server url"
            placeholder="typically https://myserver.looker.com:9999"
            name="lookerUrl"
            defaultValue={fields.lookerUrl}
            onChange={handleUrlChange}
          />
        </Fieldset>
        <FieldRadioGroup
          description="Configuration storage location"
          label="Save to"
          name="location"
          options={storageOptions}
          defaultValue={fields.location}
          onChange={handleLocationChange}
          inline
          required
        />
        {!dialogue && (
          <>
            <Button
              onClick={handleFormSubmit}
              disabled={Object.keys(validationMessages).length > 0}
            >
              Save
            </Button>
            <Button onClick={handleRemove}>Remove</Button>
          </>
        )}
      </Form>
    </>
  )
}
