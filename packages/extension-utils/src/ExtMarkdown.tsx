/*

 Copyright 2021-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import type { FC, ReactNode } from 'react';
import React from 'react';
import { Markdown } from '@looker/code-editor';
import { getEnvAdaptor } from './adaptorUtils';

interface ExtMarkdownProps {
  source: string;
  pattern?: string;
  transformLinkUri?: (url: string) => string;
  linkClickHandler?: (pathname: string, href: string) => void;
  paragraphOverride?: ({ children }: { children: ReactNode }) => ReactNode;
}

/**
 * Simple wrapper on the standard Markdown component to handle link clicks in an extension
 * @param source markdown to render
 * @param pattern search pattern
 * @param transformLinkUri link pattern transformer override
 * @param linkClickHandler defaults to ExtensionSDK.openBrowserWindow()
 * @param paragraphOverride override paragraph display handling
 */
export const ExtMarkdown: FC<ExtMarkdownProps> = ({
  source,
  pattern = '',
  transformLinkUri,
  linkClickHandler,
  paragraphOverride,
}) => {
  const openBrowserWindow = (_pathname: string, href: string) => {
    if (/^https?:\/\//i.test(href)) {
      const adaptor = getEnvAdaptor();
      adaptor.openBrowserWindow(href);
    }
  };

  return (
    <Markdown
      source={source}
      pattern={pattern}
      transformLinkUri={transformLinkUri}
      linkClickHandler={linkClickHandler || openBrowserWindow}
      paragraphOverride={paragraphOverride}
    />
  );
};
