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

import React, { useEffect, useState } from 'react';
import {
  InputText,
  CopyToClipboard,
  Space,
  SpaceVertical,
  Button,
  Heading,
  Label,
  Span,
  Section,
  ButtonOutline,
  ToggleSwitch,
} from '@looker/components';
import { Link } from '@styled-icons/material-outlined';
import { EmbedUrl } from '@looker/embed-services';
import { useThemesStoreState, SelectTheme, useThemeActions } from '../Theme';

interface QuickEmbedProps {
  /** A function triggered when close button is clicked. */
  onClose: () => void;
  /**
   * An optional callback triggered when the copy button is clicked.
   * The copy to clipboard action is already handled
   */
  onCopy?: () => void;
}

export const QuickEmbed = ({ onClose, onCopy }: QuickEmbedProps) => {
  const service = new EmbedUrl();
  const [toggleValue, setToggle] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>(service.embedUrl(false));
  const { selectedTheme } = useThemesStoreState();
  const { selectThemeAction } = useThemeActions();

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    }
  };

  const handleToggle = () => {
    const newToggleValue = !toggleValue;
    if (newToggleValue) {
      // Change the selected theme if there's a theme param in the url
      const urlThemeName = service.searchParams.theme;
      if (urlThemeName) {
        selectThemeAction({ key: urlThemeName });
      }
    }
    setToggle(newToggleValue);
  };

  useEffect(() => {
    let overrides;
    if (service.isThemable) {
      overrides = { theme: selectedTheme.name };
    }
    const newUrl = service.embedUrl(toggleValue, overrides);
    setEmbedUrl(newUrl);
  }, [toggleValue, selectedTheme]);

  return (
    <Section padding="large">
      <Heading as="h3" fontWeight="medium">
        Get embed URL
      </Heading>

      <SpaceVertical pt="medium" pb="medium" gap="xsmall">
        {service.isThemable && (
          <>
            <Span fontWeight="normal" fontSize="xsmall">
              Apply theme to {service.contentType.toLocaleLowerCase()} URL
            </Span>
            <SelectTheme />
          </>
        )}
        <>
          <Label htmlFor="embed-url" fontWeight="normal" fontSize="xsmall">
            Embed URL
          </Label>
          <InputText
            id="embed-url"
            iconBefore={<Link />}
            readOnly
            value={embedUrl}
          />
        </>
      </SpaceVertical>

      <Space gap="xxsmall" fontWeight="normal" fontSize="small">
        <ToggleSwitch onChange={handleToggle} on={toggleValue} />
        Include current params in URL
      </Space>

      <Space mt="large" between>
        <Space onClick={handleCopy} width="fit-content">
          <CopyToClipboard content={embedUrl}>
            <ButtonOutline iconBefore={<Link />}>Copy Link</ButtonOutline>
          </CopyToClipboard>
        </Space>
        <Button onClick={onClose}>Close</Button>
      </Space>
    </Section>
  );
};
