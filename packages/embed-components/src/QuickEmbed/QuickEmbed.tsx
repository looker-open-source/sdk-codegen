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
import React, { useState } from 'react'
import {
  InputText,
  CopyToClipboard,
  Space,
  Button,
  Span,
  Section,
  ButtonOutline,
} from '@looker/components'
import { Link } from '@styled-icons/material-outlined/Link'
import type { Themes } from '@looker/embed-services'
import { SelectTheme } from '..'

interface QuickEmbedProps {
  service: Themes
}

export const QuickEmbed = ({ service }: QuickEmbedProps) => {
  const [embedUrl, setEmbedUrl] = useState<string>(service.embedUrl())

  const handleChange = (theme: string) => {
    setEmbedUrl(service.embedUrl(theme))
  }

  return (
    <Section padding="large">
      <Span fontWeight="medium" fontSize="large">
        Get embed url
      </Span>
      <InputText
        mt="large"
        mb="large"
        iconBefore={<Link />}
        readOnly
        value={embedUrl}
      />
      <Span fontWeight="normal" fontSize="small">
        Apply theme to URL
      </Span>
      <SelectTheme service={service} onChange={handleChange} />
      <Space mt="large" between>
        <CopyToClipboard content={embedUrl}>
          <ButtonOutline iconBefore={<Link />}>Copy Link</ButtonOutline>
        </CopyToClipboard>
        <Button>Cancel</Button>
      </Space>
    </Section>
  )
}
