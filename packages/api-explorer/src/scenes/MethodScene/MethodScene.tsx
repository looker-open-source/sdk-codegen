/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

import React, { FC, useContext, useState, useEffect } from 'react'
import {
  Aside,
  Button,
  ButtonOutline,
  ComponentsProvider,
  Space,
  Section,
  useToggle,
} from '@looker/components'
import { ThemeContext } from 'styled-components'
import { useParams } from 'react-router-dom'
import { RunIt, RunItContext } from '@looker/run-it'
import { ApiModel, typeRefs } from '@looker/sdk-codegen'
import {
  DocActivityType,
  DocMarkdown,
  DocRateLimited,
  DocReferences,
  DocResponses,
  DocSDKs,
  DocSdkUsage,
  DocStatus,
  DocTitle,
} from '../../components'
import { DocOperation } from './components'
import { createInputs } from './utils'

interface DocMethodProps {
  api: ApiModel
}

interface DocMethodParams {
  methodName: string
  specKey: string
}

export const MethodScene: FC<DocMethodProps> = ({ api }) => {
  const { sdk } = useContext(RunItContext)
  const { methodName, specKey } = useParams<DocMethodParams>()
  const { value, toggle } = useToggle()
  const [method, setMethod] = useState(api.methods[methodName])
  const seeTypes = typeRefs(api, method.customTypes)

  useEffect(() => {
    setMethod(api.methods[methodName])
  }, [methodName])

  const { colors } = useContext(ThemeContext)

  const RunItButton = value ? Button : ButtonOutline
  const runItToggle = (
    <RunItButton
      color={value ? 'key' : 'neutral'}
      iconBefore="Beaker"
      onClick={toggle}
    >
      Run It
    </RunItButton>
  )

  return (
    <>
      <Section p="xxlarge">
        <Space between>
          <DocTitle>{method.summary}</DocTitle>
          {runItToggle}
        </Space>
        <Space mb="xlarge" gap="small">
          <DocStatus method={method} />
          <DocActivityType method={method} />
          <DocRateLimited method={method} />
        </Space>
        <DocOperation method={method} />
        <DocMarkdown source={method.description} specKey={specKey} />
        <DocSDKs api={api} method={method} />
        <DocSdkUsage method={method} />
        <DocReferences seeTypes={seeTypes} api={api} specKey={specKey} />
        <DocResponses responses={method.responses} />
      </Section>
      {sdk && value && (
        <Aside width="50rem">
          <ComponentsProvider
            globalStyle={false}
            themeCustomizations={{
              colors: { background: colors.text, text: colors.background },
            }}
          >
            <RunIt
              api={api}
              inputs={createInputs(api, method)}
              method={method}
            />
          </ComponentsProvider>
        </Aside>
      )}
    </>
  )
}
