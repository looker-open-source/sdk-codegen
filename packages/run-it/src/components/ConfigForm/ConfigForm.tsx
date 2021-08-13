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
  MessageBar,
  ValidationMessages,
  Paragraph,
  Link,
  MessageBarIntent,
} from '@looker/components'
import { CodeDisplay } from '@looker/code-editor'
import { CheckProgress } from '@looker/icons'
import { Delete } from '@styled-icons/material/Delete'
import { Done } from '@styled-icons/material/Done'
import {
  RunItConfigKey,
  validateUrl,
  RunItConfigurator,
  loadSpecsFromVersions,
  ILoadedSpecs,
} from './configUtils'

interface FetchMessageProps {
  message: string
  intent: MessageBarIntent
}

const FetchMessage: FC<FetchMessageProps> = ({ message, intent }) => {
  if (!message) return <></>
  return (
    <MessageBar intent={intent} visible={message !== ''}>
      {message}
    </MessageBar>
  )
}

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
  webUrl: '',
  /** not currently used but declared for property compatibility for ILoadedSpecs */
  headless: false,
  specs: {},
  fetchResult: '',
  fetchIntent: 'positive',
}

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  setHasConfig,
  configurator,
}) => {
  const fetchIntent = 'fetchIntent'
  const fetchResult = 'fetchResult'
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
      webUrl: looker_url,
      [fetchIntent]:
        base_url !== '' && looker_url !== '' ? 'positive' : 'critical',
    }))
  }, [configurator])

  const [validationMessages, setValidationMessages] =
    useState<ValidationMessages>({})

  const updateForm = async (e: BaseSyntheticEvent, save: boolean) => {
    e.preventDefault()
    try {
      updateFields(fetchResult, '')
      const { webUrl, baseUrl } = await loadSpecsFromVersions(
        `${fields.baseUrl}/versions`
      )
      if (!baseUrl || !webUrl) {
        throw new Error('Invalid server configuration')
      }
      updateFields('baseUrl', baseUrl)
      updateFields('webUrl', webUrl)
      updateFields(fetchIntent, 'positive')
      updateFields(fetchResult, 'Configuration is valid')
      if (save) {
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
      }
    } catch (err) {
      updateFields(fetchResult, err.message)
      updateFields(fetchIntent, 'critical')
    }
  }

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    await updateForm(e, true)
  }

  const handleVerify = async (e: BaseSyntheticEvent) => {
    await updateForm(e, false)
  }

  const handleRemove = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    configurator.removeStorage(RunItConfigKey)
    setFields(defaultFieldValues)
    if (setHasConfig) setHasConfig(false)
  }

  const updateFields = (name: string, value: string) => {
    setFields((previousFields) => {
      const newFields = { ...previousFields, ...{ [name]: value } }
      return newFields
    })
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

  const verifyButtonDisabled =
    fields.baseUrl.trim().length === 0 ||
    Object.keys(validationMessages).length > 0

  const saveButtonDisabled =
    verifyButtonDisabled || fields[fetchIntent] !== 'positive'

  const removeButtonDisabled =
    fields.webUrl.trim().length === 0 && fields.baseUrl.trim().length === 0

  return (
    <>
      <DialogHeader hideClose>{title}</DialogHeader>
      <DialogContent>
        <Form onSubmit={handleSubmit} validationMessages={validationMessages}>
          <Fieldset legend="Server locations">
            <FetchMessage
              intent={fields[fetchIntent]}
              message={fields[fetchResult]}
            />
            <FieldText
              required
              label="API server URL"
              placeholder="typically https://myserver.looker.com:19999"
              name="baseUrl"
              defaultValue={fields.baseUrl}
              onChange={handleUrlChange}
            />
            <FieldText
              label="Auth server URL"
              placeholder="Click 'Verify' to retrieve"
              name="webUrl"
              defaultValue={fields.webUrl}
              disabled={true}
            />
          </Fieldset>
        </Form>
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
          onClick={handleSubmit}
          mr="small"
        >
          Save
        </Button>
        <Button
          iconBefore={<CheckProgress />}
          disabled={verifyButtonDisabled}
          onClick={handleVerify}
          mr="small"
        >
          Verify
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
