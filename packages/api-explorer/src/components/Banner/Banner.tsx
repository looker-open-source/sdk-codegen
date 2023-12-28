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
import { ButtonOutline, Link, MessageBar } from '@looker/components';
import type { IEnvironmentAdaptor } from '@looker/extension-utils';
import type { SpecList } from '@looker/sdk-codegen';
import type { FC } from 'react';
import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'api-40-ga-apix-banner';
const LOCAL_STORAGE_VALUE = 'dismissed';

export interface BannerProps {
  adaptor: IEnvironmentAdaptor;
  specs: SpecList;
}

export const Banner: FC<BannerProps> = ({ adaptor, specs }) => {
  const [isOpen, setOpen] = useState(false);
  useEffect(onLoad, []);

  if (isOpen) {
    return (
      <MessageBar
        intent="inform"
        onPrimaryClick={onClose}
        secondaryAction={
          <Link
            href="https://developers.looker.com/api/advanced-usage/version-4-ga"
            target="_blank"
          >
            <ButtonOutline size="small">Announcement</ButtonOutline>
          </Link>
        }
      >
        API 4.0 moves from Beta to General Availability in Looker 22.4 with
        additions and possible breaking changes. Read the announcement to see
        how this affects you.
      </MessageBar>
    );
  } else {
    return null;
  }

  function onLoad() {
    // Following best practice with inner async function
    // https://github.com/facebook/react/issues/14326
    async function innerOnLoad() {
      // 4.0 is stable in Looker 22.4+. 4.0 is default or `current` in 22.4+.
      // Still check for `stable` just in case new version comes along.
      const is40Stable =
        specs['4.0'].status === 'stable' || specs['4.0'].status === 'current';
      const wasDismissed =
        (await adaptor.localStorageGetItem(LOCAL_STORAGE_KEY)) ===
        LOCAL_STORAGE_VALUE;
      setOpen(!is40Stable && !wasDismissed && adaptor.isExtension());
    }
    innerOnLoad();
  }

  function onClose() {
    adaptor.localStorageSetItem(LOCAL_STORAGE_KEY, LOCAL_STORAGE_VALUE);
    setOpen(false);
  }
};
