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

import React, {
  BaseSyntheticEvent,
  Dispatch,
  FC,
  FormEvent,
  useState,
  useContext,
  useEffect,
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
  Text,
  ValidationMessages,
  Paragraph,
  Link,
} from '@looker/components'
import { CodeDisplay } from '@looker/code-editor/src'
import { Delete } from '@styled-icons/material/Delete'
import { Done } from '@styled-icons/material/Done'
import {
  RunItConfigKey,
  validateUrl,
  RunItConfigurator,
  loadSpecsFromVersions,
  ILoadedSpecs,
} from './configUtils'

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

const defaultFieldValues = {
  baseUrl: '',
  lookerUrl: '',
  webUrl: '',
  headless: false,
  specs: {},
  fetchError: '',
}

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  setHasConfig,
  configurator,
}) => {
  const { closeModal } = useContext(DialogContext)
  const appConfig = `{
  "client_guid": "looker.api-explorer",
  "redirect_uri": "${(window as any).location.origin}/oauth",
  "display_name": "CORS API Explorer",
  "description": "Looker API Explorer using CORS",
  "enabled": true
}
`

  // See https://codesandbox.io/s/youthful-surf-0g27j?file=/src/index.tsx for a prototype from Luke
  // TODO see about useReducer to clean this up a bit more
  title = title || 'RunIt Configuration'

  const [fields, setFields] = useState<ILoadedSpecs>(defaultFieldValues)

  useEffect(() => {
    // get configuration from storage, or default it
    const storage = configurator.getStorage(RunItConfigKey)
    const config = storage.value
      ? JSON.parse(storage.value)
      : { base_url: '', looker_url: '' }
    const { base_url, looker_url } = config
    setFields((currentFields) => ({
      ...currentFields,
      baseUrl: base_url,
      lookerUrl: looker_url,
    }))
  }, [configurator])

  const [validationMessages, setValidationMessages] =
    useState<ValidationMessages>({})

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    try {
      updateFields('fetchError', '')
      const { webUrl, baseUrl } = await loadSpecsFromVersions(
        `${fields.baseUrl}/versions`
      )
      updateFields('baseUrl', baseUrl)
      await configurator.removeStorage(RunItConfigKey)
      configurator.setStorage(
        RunItConfigKey,
        JSON.stringify({
          base_url: baseUrl,
          looker_url: webUrl,
        }),
        // Always store in local storage
        'local'
      )
      if (setHasConfig) setHasConfig(true)
      closeModal()
    } catch (err) {
      updateFields('fetchError', err.message)
    }
  }

  const handleRemove = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    configurator.removeStorage(RunItConfigKey)
    setFields(defaultFieldValues)
    if (setHasConfig) setHasConfig(false)
  }

  const updateFields = (name: string, value: string) => {
    // console.log('updateFields', { name, value })
    const newFields = { ...fields }
    newFields[name] = value
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
    updateFields(event.currentTarget.name, event.currentTarget.value)

    setValidationMessages(newValidationMessages)
  }

  const saveButtonDisabled =
    fields.baseUrl.trim().length === 0 ||
    Object.keys(validationMessages).length > 0

  const removeButtonDisabled =
    fields.webUrl.trim().length === 0 && fields.baseUrl.trim().length === 0

  return (
    <>
      <DialogHeader hideClose>{title}</DialogHeader>
      <DialogContent>
        <Form onSubmit={handleSubmit} validationMessages={validationMessages}>
          <Fieldset legend="Server locations">
            <FieldText
              required
              label="Looker API server url"
              placeholder="typically https://myserver.looker.com:19999"
              name="baseUrl"
              defaultValue={fields.baseUrl}
              onChange={handleUrlChange}
            />
            <FieldText
              required
              label="Looker Web server url"
              placeholder="typically https://myserver.looker.com:9999"
              name="lookerUrl"
              defaultValue={fields.webUrl}
              disabled={true}
            />
          </Fieldset>
        </Form>
        {fields.fetchError && (
          <>
            <Text color="danger">{fields.fetchError}</Text>
          </>
        )}
        <Paragraph>
          The following configuration can be used to create a{' '}
          <Link
            href="https://github.com/looker-open-source/sdk-codegen/blob/main/docs/cors.md#reference-implementation"
            target="_blank"
          >
            Looker OAuth client
          </Link>
          .
        </Paragraph>
        <CodeDisplay key="appConfig" language="json" code={appConfig} />
      </DialogContent>
      <DialogFooter>
        <Button
          iconBefore={<Done />}
          disabled={saveButtonDisabled}
          // TODO maybe validationMessages is breaking the submit?
          onClick={handleSubmit}
          mr="small"
        >
          Save
        </Button>
        <Button
          onClick={handleRemove}
          iconBefore={<Delete />}
          color="critical"
          disabled={removeButtonDisabled}
        >
          Remove
        </Button>
      </DialogFooter>
    </>
  )
}
