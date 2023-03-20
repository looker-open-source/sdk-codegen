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
import React, { useState, useEffect } from 'react'
import {
  ComponentsProvider,
  Dialog,
  IconButton,
  Flex,
  FlexItem,
  Heading,
} from '@looker/components'
import type { IEnvironmentAdaptor } from '@looker/extension-utils'
import { Themes } from '@looker/embed-services'
import { QuickEmbed } from '@looker/embed-components'
import { FlashOn } from '@styled-icons/material-outlined/FlashOn'
import { me } from '@looker/sdk'

interface EmbedPlaygroundProps {
  adaptor: IEnvironmentAdaptor
  headless?: boolean
}

export const EmbedPlayground = ({ adaptor }: EmbedPlaygroundProps) => {
  const [greeting, setGreeting] = useState('')
  const sdk = adaptor.sdk
  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = await sdk.ok(me(sdk))
      if (currentUser) {
        const { first_name } = currentUser

        setGreeting(`Hi ${first_name}, are you ready to embed?`)
      }
      return currentUser
    }
    getCurrentUser()
  })

  const themeOverrides = adaptor.themeOverrides()

  return (
    <ComponentsProvider
      loadGoogleFonts={themeOverrides.loadGoogleFonts}
      themeCustomizations={themeOverrides.themeCustomizations}
    >
      <Flex flexDirection="column" justifyContent="center" mt="30%">
        <FlexItem alignSelf="center">
          <Heading as="h2" color="key" pb="large">
            {greeting}
          </Heading>
        </FlexItem>
        <Dialog content={<QuickEmbed service={new Themes(adaptor.sdk)} />}>
          <FlexItem alignSelf="center">
            <IconButton
              label="Quick Embed"
              type="button"
              icon={<FlashOn />}
              size="large"
            />
          </FlexItem>
        </Dialog>
      </Flex>
    </ComponentsProvider>
  )
}
