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

import type { BaseSyntheticEvent, Dispatch, FC, FormEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { ValidationMessages, MessageBarIntent } from '@looker/components';
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
  Tooltip,
} from '@looker/components';
import { CodeCopy } from '@looker/code-editor';
import { appPath, getEnvAdaptor } from '@looker/extension-utils';
import type { ILookerVersions } from '@looker/sdk-codegen';

import { useLocation } from 'react-router-dom';
import type { RunItValues } from '../..';
import { CollapserCard, RunItHeading, DarkSpan, readyToLogin } from '../..';
import {
  getVersions,
  RunItConfigKey,
  RunItNoConfig,
  RunItFormKey,
  validateUrl,
} from './utils';

const POSITIVE: MessageBarIntent = 'positive';

interface IFieldValues {
  baseUrl: string;
  webUrl: string;
  fetchIntent: MessageBarIntent;
  fetchResult: string;
}

const defaultFieldValues: IFieldValues = {
  baseUrl: '',
  webUrl: '',
  fetchResult: '',
  fetchIntent: POSITIVE,
};

interface ConfigFormProps {
  /** A collection type react state to store path, query and body parameters as entered by the user  */
  requestContent: RunItValues;
  /** Title for the config form */
  title?: string;
  /** A set state callback which allows for editing, setting or clearing OAuth configuration parameters if present */
  setHasConfig?: Dispatch<boolean>;
}

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  requestContent,
  setHasConfig,
}) => {
  const location = useLocation();
  const redirect_uri = appPath(location, '/oauth');
  const client_id = 'looker.api-explorer'; // TODO make this configurable
  const BASE_URL = 'baseUrl';
  const WEB_URL = 'webUrl';
  const FETCH_INTENT = 'fetchIntent';
  const FETCH_RESULT = 'fetchResult';
  const CRITICAL: MessageBarIntent = 'critical';
  const appConfig = `// client_guid=${client_id}
{
  "redirect_uri": "${redirect_uri}",
  "display_name": "CORS API Explorer",
  "description": "Looker API Explorer using CORS",
  "enabled": true
}
`;
  const adaptor = getEnvAdaptor();
  const sdk = adaptor.sdk;
  // See https://codesandbox.io/s/youthful-surf-0g27j?file=/src/index.tsx for a prototype from Luke
  // TODO see about useReducer to clean this up a bit more
  title = title || 'RunIt Configuration';

  const getConfig = () => {
    // TODO: This is temporary until config settings are available in redux.
    // get configuration from storage, or default it
    const data = localStorage.getItem(RunItConfigKey);
    const result = data ? JSON.parse(data) : RunItNoConfig;
    return result;
  };

  const config = getConfig();
  const [fields, setFields] = useState<IFieldValues>(defaultFieldValues);
  const [saved, setSaved] = useState<RunItValues>(config);

  const updateFields = (
    nameOrValues: string | Partial<IFieldValues>,
    value = ''
  ) => {
    if (typeof nameOrValues === 'string') {
      setFields((previousFields) => {
        return { ...previousFields, ...{ [nameOrValues]: value } };
      });
    } else {
      setFields((previousFields) => {
        return { ...previousFields, ...nameOrValues };
      });
    }
  };

  useEffect(() => {
    const data = getConfig();
    const { base_url, looker_url } = data;
    setSaved(data);
    updateFields({
      [BASE_URL]: base_url,
      [WEB_URL]: looker_url,
      [FETCH_INTENT]:
        base_url !== '' && looker_url !== '' ? POSITIVE : CRITICAL,
    });
  }, []);

  const [validationMessages, setValidationMessages] =
    useState<ValidationMessages>({});

  const updateMessage = (intent: MessageBarIntent, message: string) => {
    updateFields({ [FETCH_RESULT]: message, [FETCH_INTENT]: intent });
  };

  const isConfigured = () => {
    return (
      saved !== RunItNoConfig &&
      fields[BASE_URL] === saved.base_url &&
      fields[WEB_URL] === saved.looker_url
    );
  };

  const fetchError = (message: string) => {
    updateFields(WEB_URL, '');
    updateMessage(CRITICAL, message);
  };

  const saveConfig = (baseUrl: string, webUrl: string) => {
    const data = {
      base_url: baseUrl,
      looker_url: webUrl,
      client_id,
      redirect_uri,
    };
    updateFields({
      [BASE_URL]: baseUrl,
      [WEB_URL]: webUrl,
    });
    // TODO: replace when redux is introduced to run it
    localStorage.setItem(RunItConfigKey, JSON.stringify(data));
    if (setHasConfig) setHasConfig(true);
    setSaved(data);
    updateMessage(POSITIVE, `Saved ${webUrl} as OAuth server`);
  };

  const updateForm = async (_e: BaseSyntheticEvent, save: boolean) => {
    updateMessage('inform', '');
    const versionsUrl = `${fields.baseUrl}/versions`;
    try {
      const { web_server_url: webUrl, api_server_url: baseUrl } =
        (await getVersions(versionsUrl)) as ILookerVersions;
      updateMessage(POSITIVE, 'Configuration is valid');
      updateFields({
        [BASE_URL]: baseUrl,
        [WEB_URL]: webUrl,
      });
      if (save) {
        saveConfig(baseUrl, webUrl);
      }
    } catch (e: any) {
      fetchError(e.message);
    }
  };

  const handleSave = async (e: BaseSyntheticEvent) => {
    await updateForm(e, true);
  };

  const handleVerify = async (e: BaseSyntheticEvent) => {
    await updateForm(e, false);
  };

  const handleClear = async (_e: BaseSyntheticEvent) => {
    // TODO: replace when redux is introduced to run it
    localStorage.removeItem(RunItConfigKey);
    updateFields({
      [BASE_URL]: '',
      [WEB_URL]: '',
      [FETCH_INTENT]: CRITICAL,
      [FETCH_RESULT]: '',
    });
    setSaved(RunItNoConfig);
    if (setHasConfig) setHasConfig(false);
    if (isAuthenticated()) {
      updateMessage('warn', 'Please reload the browser page to log out');
    }
  };

  const handleUrlChange = (event: FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.name;

    const newValidationMessages = { ...validationMessages };

    const url = validateUrl(event.currentTarget.value);
    if (url) {
      delete newValidationMessages[name];
      // Update URL if it's been cleaned up
      event.currentTarget.value = url;
    } else {
      newValidationMessages[name] = {
        message: `'${event.currentTarget.value}' is not a valid url`,
        type: 'error',
      };
    }
    updateFields({
      [event.currentTarget.name]: event.currentTarget.value,
      [WEB_URL]: '',
    });

    setValidationMessages(newValidationMessages);
  };

  const isAuthenticated = () => sdk.authSession.isAuthenticated();

  const verifyButtonDisabled =
    fields.baseUrl.trim().length === 0 ||
    Object.keys(validationMessages).length > 0;

  const saveButtonDisabled =
    verifyButtonDisabled || fields.webUrl.trim().length === 0 || isConfigured();

  const clearButtonDisabled = fields.baseUrl.trim().length === 0;

  const loginButtonDisabled =
    verifyButtonDisabled || !isConfigured() || isAuthenticated();

  const handleLogin = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (requestContent) {
      // TODO: Replace when redux is introduced to run it
      localStorage.setItem(RunItFormKey, JSON.stringify(requestContent));
    }
    // This will set storage variables and return to OAuthScene when successful
    await adaptor.login();
  };

  return (
    <SpaceVertical gap="u2">
      <RunItHeading>{title}</RunItHeading>
      <DarkSpan fontSize="small">
        To configure RunIt mode, you need to supply your API server URL, then
        authenticate into your Looker Instance
      </DarkSpan>
      <MessageBar
        intent={fields[FETCH_INTENT]}
        onPrimaryClick={() => updateMessage(fields[FETCH_INTENT], '')}
        visible={fields[FETCH_RESULT] !== ''}
      >
        {fields[FETCH_RESULT]}
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
                name={BASE_URL}
                value={fields[BASE_URL]}
                onChange={handleUrlChange}
              />
              <FieldText
                label="OAuth server URL"
                placeholder="Click 'Verify' to retrieve"
                name={WEB_URL}
                value={fields[WEB_URL]}
                disabled={true}
              />
            </Fieldset>
          </Form>
          {!!fields.webUrl && (
            <>
              <Paragraph fontSize="small">
                On {fields.webUrl}, enable API Explorer as a{' '}
                <Link
                  href="https://github.com/looker-open-source/sdk-codegen/blob/main/docs/cors.md#reference-implementation"
                  target="_blank"
                >
                  Looker OAuth client
                </Link>{' '}
                by adding "{(window as any).location.origin}" to the{' '}
                <Link href={`${fields.webUrl}/admin/embed`} target="_blank">
                  Embedded Domain Allowlist
                </Link>
                . If API Explorer is also installed, the configuration below can
                be used to{' '}
                <Link
                  href={`${fields.webUrl}/extensions/marketplace_extension_api_explorer::api-explorer/4.0/methods/Auth/register_oauth_client_app`}
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
            <Tooltip content={`Verify ${fields[BASE_URL]}`}>
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
            <DarkSpan>
              You are already logged in. Reload the page to log out.
            </DarkSpan>
          ) : isConfigured() ? (
            <>
              <DarkSpan>{readyToLogin}</DarkSpan>
            </>
          ) : (
            <DarkSpan>
              You will be able to login after you Verify your API Server URL
            </DarkSpan>
          )}
          <Tooltip
            content={`Login to ${fields[WEB_URL]} using OAuth to enable RunIt`}
          >
            <Button onClick={handleLogin} disabled={loginButtonDisabled}>
              Login
            </Button>
          </Tooltip>
        </SpaceVertical>
      </CollapserCard>
    </SpaceVertical>
  );
};
