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
  useContext,
} from 'react'
import {
  Button,
  DialogHeader,
  DialogContent,
  DialogContext,
  DialogFooter,
  Fieldset,
  FieldText,
  Form,
  ValidationMessages,
} from '@looker/components'
import { RunItConfigKey, validateUrl, RunItConfigurator } from './configUtils'

interface ConfigFormProps {
  /** Title for the config form */
  title?: string
  dialogue?: boolean
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** A callback for closing the parent dialog for when the form is rendered within dialog */
  handleClose?: () => void
  configurator: RunItConfigurator
}

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  setHasConfig,
  configurator,
}) => {
  const { closeModal } = useContext(DialogContext)
  // See https://codesandbox.io/s/youthful-surf-0g27j?file=/src/index.tsx for a prototype from Luke
  // TODO see about useReducer to clean this up a bit more
  title = title || 'RunIt Configuration'

  // get configuration from storage, or default it
  const storage = configurator.getStorage(RunItConfigKey)
  let config = { base_url: '', looker_url: '' }
  if (storage.value) config = JSON.parse(storage.value)
  const { base_url, looker_url } = config

  const [fields, setFields] = useState({
    baseUrl: base_url,
    lookerUrl: looker_url,
  })

  const [validationMessages, setValidationMessages] = useState<
    ValidationMessages
  >({})

  const handleSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    configurator.removeStorage(RunItConfigKey)
    configurator.setStorage(
      RunItConfigKey,
      JSON.stringify({
        base_url: fields.baseUrl,
        looker_url: fields.lookerUrl,
      }),
      // Always store in local storage
      'local'
    )
    if (setHasConfig) setHasConfig(true)
    closeModal()
  }

  const handleRemove = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    configurator.removeStorage(RunItConfigKey)
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

  return (
    <>
      <DialogHeader hideClose>{title}</DialogHeader>
      <DialogContent>
        <Form onSubmit={handleSubmit} validationMessages={validationMessages}>
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
        </Form>
      </DialogContent>
      <DialogFooter>
        <Button
          iconBefore="Check"
          disabled={Object.keys(validationMessages).length > 0}
          // TODO maybe validationMessages is breaking the submit?
          onClick={handleSubmit}
          mr="small"
        >
          Save
        </Button>
        <Button onClick={handleRemove} iconBefore="Trash" color="critical">
          Remove
        </Button>
      </DialogFooter>
    </>
  )
}
