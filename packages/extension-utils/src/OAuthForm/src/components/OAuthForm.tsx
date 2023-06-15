/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import type { BaseSyntheticEvent, Dispatch, FormEvent } from 'react'
import React, { useEffect } from 'react'
import {
  Button,
  ButtonTransparent,
  Divider,
  Fieldset,
  FieldText,
  Form,
  MessageBar,
  Paragraph,
  Link,
  Space,
  SpaceVertical,
  Span,
  Tooltip,
} from '@looker/components'
import { CodeCopy } from '@looker/code-editor'
import { useLocation } from 'react-router-dom'
import { appPath, getEnvAdaptor } from '../../..'
import { useOAuthFormActions, useOAuthFormState } from '../state/slice'
import { CollapserCard } from './CollapserCard'
import { ConfigHeading } from './ConfigHeading'
export const readyToLogin =
  'OAuth is configured but your browser session is not authenticated. Click Login.'

interface ConfigFormProps {
  /** A set state callback which allows for editing, setting or clearing OAuth configuration parameters if present */
  setHasConfig?: Dispatch<boolean>
  /** Local storage key value for storing config parameters  */
  configKey: string
  /** OAuth client id */
  clientId: string
  /** OAuth client display label */
  clientLabel: string
}

export const OAuthForm = ({
  setHasConfig,
  clientId,
  clientLabel,
  configKey,
}: ConfigFormProps) => {
  const location = useLocation()
  const redirect_uri = appPath(location, '/oauth')
  const appConfig = `// client_guid=${clientId}
 {
   "redirect_uri": "${redirect_uri}",
   "display_name": "CORS ${clientLabel}",
   "description": "Looker ${clientLabel} using CORS",
   "enabled": true
 }
 `
  const adaptor = getEnvAdaptor()
  const sdk = adaptor.sdk

  const {
    initAction,
    handleUrlChangeAction,
    clearFormAction,
    handleVerifyAction,
    clearMessageBarAction,
    handleSaveConfigAction,
  } = useOAuthFormActions()
  const {
    apiServerUrl,
    fetchedUrl,
    webUrl,
    messageBar,
    validationMessages,
    savedConfig,
  } = useOAuthFormState()

  const isConfigured = () => {
    return (
      apiServerUrl === savedConfig.base_url &&
      webUrl === savedConfig.looker_url &&
      apiServerUrl !== '' &&
      webUrl !== ''
    )
  }

  const handleSave = () => {
    handleSaveConfigAction({
      configKey,
      setHasConfig,
      client_id: clientId,
      redirect_uri,
    })
  }

  const handleVerify = () => {
    handleVerifyAction()
  }

  const handleClear = async (_e: BaseSyntheticEvent) => {
    clearFormAction({
      configKey,
      setHasConfig: setHasConfig,
      isAuthenticated: isAuthenticated(),
    })
  }

  const handleUrlChange = (event: FormEvent<HTMLInputElement>) => {
    handleUrlChangeAction({
      name: event.currentTarget.name,
      value: event.currentTarget.value,
    })
  }

  const isAuthenticated = () => sdk.authSession.isAuthenticated()

  const verifyButtonDisabled =
    apiServerUrl.trim().length === 0 ||
    Object.keys(validationMessages).length > 0

  const saveButtonDisabled =
    verifyButtonDisabled || webUrl.trim().length === 0 || isConfigured()

  const clearButtonDisabled = apiServerUrl.trim().length === 0

  const loginButtonDisabled =
    verifyButtonDisabled || !isConfigured() || isAuthenticated()

  const handleLogin = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    // This will set storage variables and return to OAuthScene when successful
    await adaptor.login()
  }

  useEffect(() => {
    initAction(configKey)
  }, [])

  return (
    <SpaceVertical gap="u2">
      <ConfigHeading>Looker OAuth Configuration</ConfigHeading>
      <Span fontSize="small">
        To configure Looker OAuth, you need to supply your API server URL, then
        authenticate into your Looker Instance
      </Span>
      <MessageBar
        intent={messageBar.intent}
        onPrimaryClick={clearMessageBarAction}
        visible={messageBar.text !== ''}
      >
        {messageBar.text}
      </MessageBar>
      <CollapserCard
        heading="1. Supply API Server URL"
        id="server_config"
        divider={false}
        defaultOpen={!isAuthenticated()}
      >
        <SpaceVertical gap="u2" pt="u3" px="u6">
          <Form validationMessages={validationMessages}>
            <Fieldset legend="Server locations">
              <FieldText
                required
                label="API server URL"
                placeholder="typically https://myserver.looker.com:19999"
                name="baseUrl"
                value={apiServerUrl}
                onChange={handleUrlChange}
              />
              <FieldText
                label="OAuth server URL"
                placeholder="Click 'Verify' to retrieve"
                name="webUrl"
                value={webUrl}
                disabled={true}
              />
            </Fieldset>
          </Form>
          {fetchedUrl && (
            <>
              <Paragraph fontSize="small">
                On {fetchedUrl}, enable {clientLabel} as a{' '}
                <Link
                  href="https://github.com/looker-open-source/sdk-codegen/blob/main/docs/cors.md#reference-implementation"
                  target="_blank"
                >
                  Looker OAuth client
                </Link>{' '}
                by adding "{(window as any).location.origin}" to the{' '}
                <Link href={`${webUrl}/admin/embed`} target="_blank">
                  Embedded Domain Allowlist
                </Link>
                . If API Explorer is also installed, the configuration below can
                be used to{' '}
                <Link
                  href={`${fetchedUrl}/extensions/marketplace_extension_api_explorer::api-explorer/4.0/methods/Auth/register_oauth_client_app`}
                  target="_blank"
                >
                  register this API Explorer instance
                </Link>{' '}
                as an OAuth client.
              </Paragraph>
              <CodeCopy key="appConfig" language="json" code={appConfig} />
            </>
          )}
          <Space>
            <Tooltip content="Clear the configuration values">
              <ButtonTransparent
                onClick={handleClear}
                disabled={clearButtonDisabled}
              >
                Clear
              </ButtonTransparent>
            </Tooltip>
            <Tooltip content={`Verify ${apiServerUrl}`}>
              <ButtonTransparent
                disabled={verifyButtonDisabled}
                onClick={handleVerify}
                mr="small"
              >
                Verify
              </ButtonTransparent>
            </Tooltip>
            <Tooltip content="Save the configuration for this browser">
              <Button
                disabled={saveButtonDisabled}
                onClick={handleSave}
                mr="small"
              >
                Save
              </Button>
            </Tooltip>
          </Space>
        </SpaceVertical>
      </CollapserCard>
      <Divider appearance="light" />
      <CollapserCard
        heading="2. Login to instance"
        divider={false}
        id="login_section"
        defaultOpen={!isAuthenticated()}
      >
        <SpaceVertical pt="u3" px="u6">
          {isAuthenticated() ? (
            <Span>You are already logged in. Reload the page to log out.</Span>
          ) : isConfigured() ? (
            <>
              <Span>{readyToLogin}</Span>
            </>
          ) : (
            <Span>
              You will be able to login after you Verify your API Server URL
            </Span>
          )}
          <Tooltip content={`Login to ${webUrl} using OAuth`}>
            <Button onClick={handleLogin} disabled={loginButtonDisabled}>
              Login
            </Button>
          </Tooltip>
        </SpaceVertical>
      </CollapserCard>
    </SpaceVertical>
  )
}
