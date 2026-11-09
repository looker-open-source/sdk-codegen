/*

 Copyright 2022-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import React from 'react';
import { Link } from '@looker/components';
import { getEnvAdaptor } from '../adaptorUtils';

interface APIErrorDocLinkProps {
  docUrl?: string;
}

export const APIErrorDocLink = ({ docUrl }: APIErrorDocLinkProps) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const adaptor = getEnvAdaptor();
    adaptor.openBrowserWindow(e.currentTarget.href);
  };

  if (!docUrl || !/^https?:\/\//i.test(docUrl)) return <></>;
  return (
    <Link href={docUrl} key={docUrl} onClick={onClick}>
      More information
    </Link>
  );
};
