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

import React, { FC, useContext, useState, useEffect } from 'react'
import {
  Aside,
  Button,
  ButtonOutline,
  Space,
  useToggle,
  ExtendComponentsThemeProvider,
} from '@looker/components'
import { Beaker } from '@looker/icons'
import { ThemeContext } from 'styled-components'
import { useParams } from 'react-router-dom'
import { RunIt, RunItSetter, RunItContext, RunItFormKey } from '@looker/run-it'
import { ApiModel, typeRefs } from '@looker/sdk-codegen'
import { useSelector } from 'react-redux'

import {
  ApixSection,
  DocActivityType,
  DocMarkdown,
  DocRateLimited,
  DocReferences,
  DocResponses,
  DocSDKs,
  DocSdkUsage,
  DocSource,
  DocStatus,
  DocTitle,
  DocSchema,
} from '../../components'
import { getSelectedSdkLanguage } from '../../state'
import { IApixEnvAdaptor } from '../../utils'
import { DocOperation, DocRequestBody } from './components'
import { createInputs } from './utils'

interface MethodSceneProps {
  api: ApiModel
  envAdaptor: IApixEnvAdaptor
  setVersionsUrl: RunItSetter
}

interface MethodSceneParams {
  methodName: string
  specKey: string
}

const showRunIt = (envAdaptor: IApixEnvAdaptor) => {
  return !!envAdaptor.localStorageGetItem(RunItFormKey)
}

export const MethodScene: FC<MethodSceneProps> = ({
  api,
  envAdaptor,
  setVersionsUrl,
}) => {
  const { sdk } = useContext(RunItContext)
  const sdkLanguage = useSelector(getSelectedSdkLanguage)
  const { methodName, specKey } = useParams<MethodSceneParams>()
  const { value, toggle } = useToggle(showRunIt(envAdaptor))
  const [method, setMethod] = useState(api.methods[methodName])
  const seeTypes = typeRefs(api, method.customTypes)
  const { colors } = useContext(ThemeContext)

  const RunItButton = value ? Button : ButtonOutline

  useEffect(() => {
    setMethod(api.methods[methodName])
  }, [api, methodName])

  const runItToggle = (
    <RunItButton
      color={value ? 'key' : 'neutral'}
      iconBefore={<Beaker />}
      onClick={toggle}
    >
      Run It
    </RunItButton>
  )

  return (
    <>
      <ApixSection>
        <Space between>
          <Space>
            <DocTitle>{method.summary}</DocTitle>
            <DocSource method={method} />
          </Space>
          {runItToggle}
        </Space>
        <Space mb="large" gap="small">
          <DocStatus method={method} />
          <DocActivityType method={method} />
          <DocRateLimited method={method} />
        </Space>
        <DocOperation method={method} />
        <DocMarkdown source={method.description} specKey={specKey} />
        <DocSDKs api={api} method={method} />
        <DocRequestBody method={method} />
        <DocSdkUsage method={method} />
        <DocReferences typesUsed={seeTypes} api={api} specKey={specKey} />
        <DocResponses responses={method.responses} />
        <DocSchema object={method.schema} />
      </ApixSection>
      {sdk && value && (
        <Aside width="50rem">
          <ExtendComponentsThemeProvider
            themeCustomizations={{
              colors: {
                background: colors.text,
                text: colors.background,
              },
            }}
          >
            <RunIt
              sdkLanguage={sdkLanguage}
              api={api}
              inputs={createInputs(api, method)}
              method={method}
              setVersionsUrl={setVersionsUrl}
            />
          </ExtendComponentsThemeProvider>
        </Aside>
      )}
    </>
  )
}
