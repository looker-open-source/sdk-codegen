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
import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import {
  Aside,
  ComponentsProvider,
  Divider,
  Heading,
  IconButton,
  Layout,
  Page,
  Space,
} from '@looker/components';
import { FirstPage } from '@styled-icons/material/FirstPage';
import { LastPage } from '@styled-icons/material/LastPage';
import {
  registerEnvAdaptor,
  unregisterEnvAdaptor,
} from '@looker/extension-utils';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import type { IApixAdaptor } from './utils';
import {
  Header,
  SideNav,
  ErrorBoundary,
  SelectorContainer,
  HEADER_TOGGLE_LABEL,
  Loader,
  Banner,
} from './components';
import { AppRouter } from './routes';
import { apixFilesHost } from './utils/lodeUtils';
import {
  useSettingActions,
  useLodeActions,
  useLodesStoreState,
  useSpecActions,
  useSpecStoreState,
  selectSpecs,
  selectCurrentSpec,
  useSettingStoreState,
} from './state';
import { getSpecKey, findSdk, useGlobalStoreSync } from './utils';

export interface ApiExplorerProps {
  adaptor: IApixAdaptor;
  examplesLodeUrl?: string;
  declarationsLodeUrl?: string;
  headless?: boolean;
}

const BodyOverride = createGlobalStyle` html { height: 100%; overflow: hidden; } `;

export const ApiExplorer: FC<ApiExplorerProps> = ({
  adaptor,
  examplesLodeUrl = 'https://raw.githubusercontent.com/looker-open-source/sdk-codegen/main/examplesIndex.json',
  declarationsLodeUrl = `${apixFilesHost}/declarationsIndex.json`,
  headless = false,
}) => {
  useLodesStoreState();
  const { working, description } = useSpecStoreState();
  const specs = useSelector(selectSpecs);
  const spec = useSelector(selectCurrentSpec);
  const { initLodesAction } = useLodeActions();
  const { initialized } = useSettingStoreState();
  const { initSettingsAction, setSearchPatternAction, setSdkLanguageAction } =
    useSettingActions();
  const { initSpecsAction, setCurrentSpecAction } = useSpecActions();

  const location = useLocation();
  useGlobalStoreSync();
  const [hasNavigation, setHasNavigation] = useState(true);
  const toggleNavigation = (target?: boolean) =>
    setHasNavigation(target || !hasNavigation);

  const hasNavigationToggle = useCallback((e: MessageEvent<any>) => {
    if (e.origin === window.origin && e.data.action === 'toggle_sidebar') {
      setHasNavigation((currentHasNavigation) => !currentHasNavigation);
    }
  }, []);

  registerEnvAdaptor(adaptor);

  useEffect(() => {
    initSettingsAction();
    initLodesAction({ examplesLodeUrl, declarationsLodeUrl });

    const specKey = getSpecKey(location);
    initSpecsAction({ specKey });
    return () => unregisterEnvAdaptor();
  }, []);

  useEffect(() => {
    const maybeSpec = location.pathname?.split('/')[1];
    if (spec && maybeSpec && maybeSpec !== spec.key) {
      setCurrentSpecAction({ currentSpecKey: maybeSpec });
    }
  }, [location.pathname, spec]);

  useEffect(() => {
    if (!initialized) return;
    const searchParams = new URLSearchParams(location.search);
    const searchPattern = searchParams.get('s') || '';
    const sdkParam = searchParams.get('sdk') || 'all';
    const { language: sdkLanguage } = findSdk(sdkParam);
    setSearchPatternAction({ searchPattern });
    setSdkLanguageAction({ sdkLanguage });
  }, [location.search]);

  useEffect(() => {
    if (headless) {
      window.addEventListener('message', hasNavigationToggle);
    }
    return () => {
      if (headless) {
        window.removeEventListener('message', hasNavigationToggle);
      }
    };
  }, [headless, hasNavigationToggle]);

  const themeOverrides = adaptor.themeOverrides();

  let neededSpec = location.pathname?.split('/')[1];
  if (!neededSpec) {
    neededSpec = spec?.key;
  }

  return (
    <>
      <ComponentsProvider
        loadGoogleFonts={themeOverrides.loadGoogleFonts}
        themeCustomizations={themeOverrides.themeCustomizations}
      >
        {working || !neededSpec || neededSpec !== spec.key ? (
          <Loader message={description} themeOverrides={themeOverrides} />
        ) : (
          <ErrorBoundary logError={adaptor.logError.bind(adaptor)}>
            <Banner adaptor={adaptor} specs={specs} />
            <Page style={{ overflow: 'hidden' }}>
              {!headless && (
                <Header spec={spec} toggleNavigation={toggleNavigation} />
              )}
              <Layout hasAside height="100%">
                <AsideBorder
                  borderRight
                  isOpen={hasNavigation}
                  headless={headless}
                >
                  {headless && (
                    <>
                      <Space
                        align="center"
                        py="u3"
                        px={hasNavigation ? 'u5' : '0'}
                        justifyItems={
                          hasNavigation ? 'space-between' : 'center'
                        }
                      >
                        {hasNavigation && (
                          <Heading
                            as="h2"
                            fontSize="xsmall"
                            fontWeight="bold"
                            color="text2"
                          >
                            API DOCUMENTATION
                          </Heading>
                        )}
                        <IconButton
                          size="xsmall"
                          shape="round"
                          icon={hasNavigation ? <FirstPage /> : <LastPage />}
                          label={HEADER_TOGGLE_LABEL}
                          onClick={() => toggleNavigation()}
                        />
                      </Space>
                      {hasNavigation && (
                        <>
                          <Divider mb="u3" appearance="light" />
                          <SelectorContainer
                            spec={spec}
                            ml="large"
                            mr="large"
                          />
                        </>
                      )}
                    </>
                  )}
                  {hasNavigation && <SideNav headless={headless} spec={spec} />}
                </AsideBorder>
                <AppRouter
                  specKey={spec.key}
                  api={spec.api!}
                  toggleNavigation={toggleNavigation}
                />
              </Layout>
            </Page>
          </ErrorBoundary>
        )}
      </ComponentsProvider>
      {!headless && <BodyOverride />}
    </>
  );
};

const AsideBorder = styled(Aside)<{
  isOpen: boolean;
  headless: boolean;
}>`
  width: ${({ isOpen, headless }) =>
    isOpen ? '20rem' : headless ? '2.75rem' : '0rem'};
`;
