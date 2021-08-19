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
  useEffect,
} from 'react'
import {
  Button,
  ButtonTransparent,
  Fieldset,
  FieldText,
  Form,
  MessageBar,
  ValidationMessages,
  Paragraph,
  Link,
  MessageBarIntent,
  Space,
  SpaceVertical,
} from '@looker/components'
import { CodeCopy } from '@looker/code-editor'
import { IAPIMethods } from '@looker/sdk-rtl'
import {
  CollapserCard,
  RunItFormKey,
  RunItHeading,
  DarkSpan,
  runItSDK,
  RunItSetter,
  RunItValues,
  readyToLogin,
} from '../..'
import {
  RunItConfigKey,
  validateUrl,
  RunItConfigurator,
  loadSpecsFromVersions,
  ILoadedSpecs,
} from './configUtils'

const positive: MessageBarIntent = 'positive'

const defaultFieldValues = {
  baseUrl: '',
  webUrl: '',
  /** not currently used but declared for property compatibility for ILoadedSpecs */
  headless: false,
  specs: {},
  fetchResult: '',
  fetchIntent: positive,
}

interface ConfigFormProps {
  configurator: RunItConfigurator
  setVersionsUrl: RunItSetter
  /** A collection type react state to store path, query and body parameters as entered by the user  */
  requestContent: RunItValues
  /** Title for the config form */
  title?: string
  /** A set state callback which if present allows for editing, setting or clearing OAuth configuration parameters */
  setHasConfig?: Dispatch<boolean>
  /** SDK to use for login. Defaults to the `runItSDK` */
  sdk?: IAPIMethods
}

export const ConfigForm: FC<ConfigFormProps> = ({
  configurator,
  setVersionsUrl,
  title,
  requestContent,
  sdk = runItSDK,
  setHasConfig,
}) => {
  const fetchIntent = 'fetchIntent'
  const fetchResult = 'fetchResult'
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
        base_url !== '' && looker_url !== '' ? positive : 'critical',
    }))
  }, [configurator])

  const [validationMessages, setValidationMessages] =
    useState<ValidationMessages>({})

  const updateMessage = (intent: MessageBarIntent, message: string) => {
    updateFields(fetchResult, message)
    updateFields(fetchIntent, intent)
  }

  const fetchError = (message: string) => {
    updateFields('webUrl', '')
    updateMessage('critical', message)
  }

  const updateForm = async (e: BaseSyntheticEvent, save: boolean) => {
    e.preventDefault()
    try {
      updateMessage('inform', '')
      const versionsUrl = `${fields.baseUrl}/versions`
      const { webUrl, baseUrl } = await loadSpecsFromVersions(versionsUrl)
      if (!baseUrl || !webUrl) {
        fetchError('Invalid server configuration')
      } else {
        updateFields('baseUrl', baseUrl)
        updateFields('webUrl', webUrl)
        updateMessage(positive, 'Configuration is valid')
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
          setVersionsUrl(versionsUrl)
        }
      }
    } catch (err) {
      fetchError(err.message)
    }
  }

  const handleSubmit = async (e: BaseSyntheticEvent) => {
    await updateForm(e, true)
  }

  const handleVerify = async (e: BaseSyntheticEvent) => {
    await updateForm(e, false)
  }

  const handleClear = (e: BaseSyntheticEvent) => {
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
    verifyButtonDisabled || fields.webUrl.trim().length > 0

  const clearButtonDisabled = fields.baseUrl.trim().length === 0

  const handleLogin = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    if (requestContent) {
      configurator.setStorage(
        RunItFormKey,
        JSON.stringify(requestContent),
        'local'
      )
    }
    // This will set storage variables and return to OAuthScene when successful
    await sdk?.authSession.login()
  }

  return (
    <>
      <RunItHeading>{title}</RunItHeading>
      <DarkSpan>
        To configure RunIt mode, you need to supply your API server URL, then
        authenticate into your Looker Instance
      </DarkSpan>
      <CollapserCard
        heading="1. Supply API Server URL"
        id="server_config"
        divider={false}
        defaultOpen={saveButtonDisabled}
      >
        <>
          <Form onSubmit={handleSubmit} validationMessages={validationMessages}>
            <Fieldset legend="Server locations">
              <MessageBar
                intent={fields[fetchIntent]}
                onPrimaryClick={() => updateMessage(fields[fetchIntent], '')}
                visible={fields[fetchResult] !== ''}
              >
                {fields[fetchResult]}
              </MessageBar>

              <FieldText
                required
                label="API server URL"
                placeholder="typically https://myserver.looker.com:19999"
                name="baseUrl"
                defaultValue={fields.baseUrl}
                onChange={handleUrlChange}
              />
              <DarkSpan>
                This is typically https://myserver.looker.com:19999
              </DarkSpan>
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
          <CodeCopy key="appConfig" language="json" code={appConfig} />
          <Space>
            <ButtonTransparent
              onClick={handleClear}
              disabled={clearButtonDisabled}
            >
              Clear
            </ButtonTransparent>
            <ButtonTransparent
              disabled={verifyButtonDisabled}
              onClick={handleVerify}
              mr="small"
            >
              Verify
            </ButtonTransparent>
            <Button
              disabled={saveButtonDisabled}
              onClick={handleSubmit}
              mr="small"
            >
              Save
            </Button>
          </Space>
        </>
      </CollapserCard>
      <CollapserCard
        heading="2. Login to instance"
        divider={false}
        id="login_section"
        defaultOpen={!saveButtonDisabled}
      >
        <SpaceVertical>
          {sdk?.authSession.isAuthenticated() ? (
            <DarkSpan>
              You are already logged in. Reload the page to log out.
            </DarkSpan>
          ) : saveButtonDisabled ? (
            <DarkSpan>
              You will be able to login after you Verify your API Server URL
            </DarkSpan>
          ) : (
            <>
              <DarkSpan>{readyToLogin}</DarkSpan>
              <Button onClick={handleLogin}>Login</Button>
            </>
          )}
        </SpaceVertical>
      </CollapserCard>
    </>
  )
}
