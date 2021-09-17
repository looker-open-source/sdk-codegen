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

import type { FC } from 'react'
import React, { useContext, useState, useEffect } from 'react'
import {
  Aside,
  Button,
  ButtonOutline,
  Space,
  useToggle,
  ExtendComponentsThemeProvider,
} from '@looker/components'
import { Beaker } from '@looker/icons'
import { useHistory, useParams } from 'react-router-dom'
import type { RunItSetter } from '@looker/run-it'
import { RunIt, RunItContext, RunItFormKey } from '@looker/run-it'
import type { ApiModel } from '@looker/sdk-codegen'
import { typeRefs } from '@looker/sdk-codegen'
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
import type { IApixEnvAdaptor } from '../../utils'
import { DocOperation, DocRequestBody } from './components'
import { createInputs } from './utils'

interface MethodSceneProps {
  api: ApiModel
  envAdaptor: IApixEnvAdaptor
  setVersionsUrl: RunItSetter
}

interface MethodSceneParams {
  methodName: string
  methodTag: string
  specKey: string
}

const showRunIt = async (envAdaptor: IApixEnvAdaptor) => {
  const data = await envAdaptor.localStorageGetItem(RunItFormKey)
  return !!data
}

export const MethodScene: FC<MethodSceneProps> = ({
  api,
  envAdaptor,
  setVersionsUrl,
}) => {
  const history = useHistory()
  const { sdk } = useContext(RunItContext)
  const sdkLanguage = useSelector(getSelectedSdkLanguage)
  const { specKey, methodTag, methodName } = useParams<MethodSceneParams>()
  const { value, toggle, setOn } = useToggle()
  const [method, setMethod] = useState(api.methods[methodName])
  const seeTypes = typeRefs(api, method?.customTypes)

  const RunItButton = value ? Button : ButtonOutline

  useEffect(() => {
    const foundMethod = api.methods[methodName]
    if (foundMethod) {
      setMethod(api.methods[methodName])
    } else {
      // Invalid method
      if (api.tags[methodTag]) {
        // Found tag though
        history.push(`/${specKey}/methods/${methodTag}`)
      } else {
        history.push(`/${specKey}/methods`)
      }
    }
  }, [api, history, methodName, specKey])

  useEffect(() => {
    const checkRunIt = async () => {
      try {
        const show = await showRunIt(envAdaptor)
        if (show) setOn()
      } catch (error) {
        console.error(error)
      }
    }
    checkRunIt()
  }, [envAdaptor, setOn])

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
      {method && (
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
      )}
      {sdk && value && (
        <Aside width="50rem">
          <ExtendComponentsThemeProvider
            themeCustomizations={{
              colors: {
                background: '#262D33',
                key: '#8AB4F8',
                text: '#fff',
                link: '#8AB4F8',
                critical: '#FF877C',
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
