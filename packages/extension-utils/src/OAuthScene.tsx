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

import type { FC } from 'react';
import React, { useEffect } from 'react';
import type { BrowserSession } from '@looker/sdk-rtl';
import {
  ComponentsProvider,
  Flex,
  FlexItem,
  Heading,
  ProgressCircular,
} from '@looker/components';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import type { IEnvironmentAdaptor } from './adaptorUtils';

interface OAuthSceneProps {
  adaptor: IEnvironmentAdaptor;
}

/**
 * OAuth scene for sdk session handling and redirection to OAuth flow initiation
 * route
 */
export const OAuthScene: FC<OAuthSceneProps> = ({ adaptor }) => {
  const history = useHistory();
  const location = useLocation();
  const reactPath = location.pathname;
  const fullPath = (window as any).location.pathname;
  const extraPath = fullPath.substr(0, fullPath.indexOf(reactPath));
  const authSession = adaptor.sdk.authSession as BrowserSession;
  const retPath = authSession.returnUrl ?? '/';
  /** If this is a nested React app, remove extraPath to prevent recursive return pathing */
  const oldUrl = retPath.replace(extraPath, '');

  useEffect(() => {
    const maybeLogin = async () => {
      const token = await adaptor.login();
      if (token) {
        console.error({ push: oldUrl, retPath, extraPath, location });
        history.push(oldUrl);
      }
    };
    maybeLogin();
  }, []);

  const themeOverrides = adaptor.themeOverrides();
  return (
    <ComponentsProvider
      loadGoogleFonts={themeOverrides.loadGoogleFonts}
      themeCustomizations={themeOverrides.themeCustomizations}
    >
      <Flex flexDirection="column" justifyContent="center" mt="25%">
        <FlexItem alignSelf="center">
          <ProgressCircular size="large" />
        </FlexItem>
        <FlexItem mt="large" alignSelf="center">
          <Heading color="key" as="h2">
            {`Returning to ${oldUrl} after OAuth login ...`}
          </Heading>
        </FlexItem>
      </Flex>
    </ComponentsProvider>
  );
};
