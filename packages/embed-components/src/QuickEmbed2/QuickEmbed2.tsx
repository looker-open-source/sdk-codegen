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
import React, { useContext, useEffect } from 'react'
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
import { embedUrl } from '@looker/embed-services'
import { LookerData, SelectTheme2 } from '..'

export const QuickEmbed2 = () => {
  const { loading, themes, currentTheme, loadThemeData, updateTheme } =
    useContext(LookerData)
  const url = embedUrl(currentTheme?.name)

  useEffect(() => {
    loadThemeData()
  }, [])

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
        value={url}
      />
      <Span fontWeight="normal" fontSize="small">
        Apply theme to URL
      </Span>
      <SelectTheme2
        loading={loading}
        currentTheme={currentTheme}
        themes={themes}
        onThemeChange={updateTheme}
      />
      <Space mt="large" between>
        <CopyToClipboard content={url}>
          <ButtonOutline iconBefore={<Link />}>Copy Link</ButtonOutline>
        </CopyToClipboard>
        <Button>Cancel</Button>
      </Space>
    </Section>
  )
}
